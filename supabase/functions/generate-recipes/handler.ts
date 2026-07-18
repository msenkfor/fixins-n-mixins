import { ANTHROPIC_MODEL, RECIPE_COUNT } from "../_shared/config.ts";
import {
  corsPreflightResponse,
  jsonResponse,
  errorResponse,
  statusFromError,
} from "../_shared/response.ts";
import type {
  DetectedIngredient,
  HandlerDeps,
  RawRecipe,
  Recipe,
  ToolUseBlock,
} from "../_shared/types.ts";
import { recipeToolDefinition } from "./tool-schema.ts";

export type { HandlerDeps };
export { recipeToolDefinition };

// ── Prompt builders ─────────────────────────────────────────────────

function buildIngredientList(ingredients: DetectedIngredient[]): string {
  return ingredients
    .map((i) => (i.quantity ? `${i.name} (${i.quantity})` : i.name))
    .join(", ");
}

function buildExclusionClause(shown: string[]): string {
  if (shown.length === 0) return "";
  const list = shown.map((t) => `- ${t}`).join("\n");
  return `\n\nDo NOT suggest any of these recipes (already shown to the user):\n${list}\n\nGenerate completely different recipes with different titles.`;
}

function buildPrompt(ingredientList: string, exclusionClause: string): string {
  return `You are a creative home chef. The user has these ingredients from their photo: ${ingredientList}

Generate exactly ${RECIPE_COUNT} diverse, practical recipes that primarily use these ingredients. Rules:
- Each recipe should use as many of the user's ingredients as possible
- You may include common pantry staples (oil, salt, pepper, butter, eggs, flour, sugar, common spices) as additional ingredients — mark these with fromPhoto: false
- Mark ingredients from the user's list with fromPhoto: true
- Recipes should be varied in cuisine style, cooking method, and complexity
- Keep prep + cook time realistic
- Steps should be clear enough for a home cook
- Each recipe needs 4-8 steps
- Description should be appetizing and under 80 characters${exclusionClause}

Use the save_recipes tool to return your recipes.`;
}

// ── Recipe enrichment ───────────────────────────────────────────────

function enrichRecipes(
  rawRecipes: RawRecipe[],
  ingredientNames: Set<string>,
): Recipe[] {
  return rawRecipes.map((raw, index) => {
    const enrichedIngredients = raw.ingredients.map((ing) => {
      const name = ing.name.trim().toLowerCase();
      return {
        name,
        quantity: String(ing.quantity),
        unit: ing.unit,
        fromPhoto: ing.fromPhoto || ingredientNames.has(name),
      };
    });

    const matchedCount = enrichedIngredients.filter(
      (ing) => ing.fromPhoto,
    ).length;

    return {
      id: `recipe-${Date.now()}-${index}`,
      title: raw.title,
      description: raw.description,
      servings: raw.servings,
      prepTimeMinutes: raw.prepTimeMinutes,
      cookTimeMinutes: raw.cookTimeMinutes,
      tags: raw.tags,
      matchedIngredientCount: matchedCount,
      totalIngredientCount: enrichedIngredients.length,
      ingredients: enrichedIngredients,
      steps: raw.steps.map((step, i) => ({
        order: step.order ?? i + 1,
        instruction: step.instruction,
      })),
    };
  });
}

/** Filter out recipes the user has already seen. */
function dedup(
  recipes: Recipe[],
  shown: string[],
): { recipes: Recipe[]; noMoreRecipes: boolean } {
  if (shown.length === 0) return { recipes, noMoreRecipes: false };

  const shownLower = new Set(shown.map((t) => t.toLowerCase().trim()));
  const novel = recipes.filter(
    (r) => !shownLower.has(r.title.toLowerCase().trim()),
  );

  return {
    recipes: novel.length > 0 ? novel : recipes,
    noMoreRecipes: novel.length === 0,
  };
}

// ── Handler ─────────────────────────────────────────────────────────

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

    // Extract tool_use block
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
    const msg = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Recipe generation failed: ${msg}`, statusFromError(error));
  }
}
