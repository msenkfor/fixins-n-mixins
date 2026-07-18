import { ANTHROPIC_MODEL } from "../_shared/config.ts";
import {
  corsPreflightResponse,
  jsonResponse,
  errorResponse,
  mapUpstreamError,
} from "../_shared/response.ts";
import type {
  DetectedIngredient,
  HandlerDeps,
  RawRecipe,
  ToolUseBlock,
} from "../_shared/types.ts";
import {
  buildExclusionClause,
  buildIngredientList,
  buildPrompt,
} from "./prompt.ts";
import { dedup, enrichRecipes } from "./recipes.ts";
import { recipeToolDefinition } from "./tool-schema.ts";

export type { HandlerDeps };
export { recipeToolDefinition };

/**
 * Generate recipes from detected ingredients via Claude tool use.
 * Expects JSON body: `{ ingredients: DetectedIngredient[], shownRecipeTitles?: string[] }`.
 */
export async function handleRequest(
  req: Request,
  deps: HandlerDeps,
): Promise<Response> {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  try {
    const apiKey = deps.getApiKey();
    if (!apiKey) return errorResponse("Server misconfiguration: missing API key", 500);

    const { ingredients, shownRecipeTitles } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return errorResponse("Missing or empty required field: ingredients", 400);
    }

    const shown: string[] = shownRecipeTitles ?? [];
    const ingredientNames = new Set(
      (ingredients as DetectedIngredient[]).map((i) => i.name.trim().toLowerCase()),
    );

    const client = deps.createClient(apiKey);

    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      tools: [recipeToolDefinition],
      tool_choice: { type: "tool", name: "save_recipes" },
      messages: [
        {
          role: "user",
          content: buildPrompt(
            buildIngredientList(ingredients),
            buildExclusionClause(shown),
          ),
        },
      ],
    });

    const toolBlock = message.content.find(
      (b): b is ToolUseBlock => b.type === "tool_use",
    );

    if (!toolBlock) {
      console.error("No tool_use block in response:", JSON.stringify(message.content));
      return errorResponse("AI model did not return structured recipes", 502);
    }

    const input = toolBlock.input as { recipes?: RawRecipe[] };
    if (!input.recipes || !Array.isArray(input.recipes)) {
      return errorResponse("AI returned invalid recipe structure", 502);
    }

    const recipes = enrichRecipes(input.recipes, ingredientNames);
    return jsonResponse(dedup(recipes, shown));
  } catch (error) {
    console.error("generate-recipes error:", error);
    const mapped = mapUpstreamError(error, "generate");
    return errorResponse(mapped.message, mapped.status);
  }
}
