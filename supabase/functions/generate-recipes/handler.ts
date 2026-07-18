import { corsHeaders } from "../_shared/cors.ts";

const RECIPE_COUNT = 5;

interface DetectedIngredient {
  name: string;
  quantity?: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  fromPhoto: boolean;
}

interface RecipeStep {
  order: number;
  instruction: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tags: string[];
  matchedIngredientCount: number;
  totalIngredientCount: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}

interface AnthropicClient {
  messages: {
    create(params: unknown): Promise<{
      content: Array<
        { type: "text"; text: string } | ToolUseBlock | { type: string }
      >;
    }>;
  };
}

export interface HandlerDeps {
  getApiKey: () => string | undefined;
  createClient: (apiKey: string) => AnthropicClient;
}

// Tool definition that forces Claude to return schema-compliant recipes
export const recipeToolDefinition = {
  name: "save_recipes",
  description:
    "Save a list of generated recipes. Call this tool with the complete recipe data.",
  input_schema: {
    type: "object" as const,
    properties: {
      recipes: {
        type: "array",
        description: `An array of exactly ${RECIPE_COUNT} recipe objects`,
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description:
                "Recipe title, capitalized (e.g. 'Chicken Stir-Fry')",
            },
            description: {
              type: "string",
              description:
                "One-sentence description of the dish (under 80 chars)",
            },
            servings: { type: "number", description: "Number of servings" },
            prepTimeMinutes: {
              type: "number",
              description: "Prep time in minutes",
            },
            cookTimeMinutes: {
              type: "number",
              description: "Cook time in minutes",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description:
                "1-3 tags like '30-min', 'one-pan', 'high-protein', 'vegetarian', 'asian', 'mexican', 'italian', 'comfort-food', 'meal-prep', 'baked'",
            },
            ingredients: {
              type: "array",
              description: "All ingredients needed for this recipe",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Ingredient name, lowercase",
                  },
                  quantity: {
                    type: "string",
                    description:
                      "Numeric quantity as string (e.g. '2', '0.5')",
                  },
                  unit: {
                    type: "string",
                    description:
                      "Unit of measurement (e.g. 'lbs', 'cups', 'tbsp', 'whole', 'cloves')",
                  },
                  fromPhoto: {
                    type: "boolean",
                    description:
                      "true if this ingredient was in the user's photo, false if it's an additional pantry staple",
                  },
                },
                required: ["name", "quantity", "unit", "fromPhoto"],
              },
            },
            steps: {
              type: "array",
              description: "Ordered cooking instructions",
              items: {
                type: "object",
                properties: {
                  order: {
                    type: "number",
                    description: "Step number starting at 1",
                  },
                  instruction: {
                    type: "string",
                    description:
                      "Clear, concise instruction (1-2 sentences max)",
                  },
                },
                required: ["order", "instruction"],
              },
            },
          },
          required: [
            "title",
            "description",
            "servings",
            "prepTimeMinutes",
            "cookTimeMinutes",
            "tags",
            "ingredients",
            "steps",
          ],
        },
      },
    },
    required: ["recipes"],
  },
};

export async function handleRequest(
  req: Request,
  deps: HandlerDeps,
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = deps.getApiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing API key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const { ingredients, shownRecipeTitles } = body as {
      ingredients?: DetectedIngredient[];
      shownRecipeTitles?: string[];
    };

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing or empty required field: ingredients",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const shown = shownRecipeTitles ?? [];

    // Build the ingredient list for the prompt
    const ingredientList = ingredients
      .map((i) => (i.quantity ? `${i.name} (${i.quantity})` : i.name))
      .join(", ");

    // Build the exclusion clause
    const exclusionClause =
      shown.length > 0
        ? `\n\nDo NOT suggest any of these recipes (already shown to the user):\n${shown.map((t) => `- ${t}`).join("\n")}\n\nGenerate completely different recipes with different titles.`
        : "";

    // Build the ingredient name set for fromPhoto matching
    const ingredientNames = new Set(
      ingredients.map((i) => i.name.trim().toLowerCase()),
    );

    const client = deps.createClient(apiKey);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      tools: [recipeToolDefinition],
      tool_choice: { type: "tool", name: "save_recipes" },
      messages: [
        {
          role: "user",
          content: `You are a creative home chef. The user has these ingredients from their photo: ${ingredientList}

Generate exactly ${RECIPE_COUNT} diverse, practical recipes that primarily use these ingredients. Rules:
- Each recipe should use as many of the user's ingredients as possible
- You may include common pantry staples (oil, salt, pepper, butter, eggs, flour, sugar, common spices) as additional ingredients — mark these with fromPhoto: false
- Mark ingredients from the user's list with fromPhoto: true
- Recipes should be varied in cuisine style, cooking method, and complexity
- Keep prep + cook time realistic
- Steps should be clear enough for a home cook
- Each recipe needs 4-8 steps
- Description should be appetizing and under 80 characters${exclusionClause}

Use the save_recipes tool to return your recipes.`,
        },
      ],
    });

    // Extract the tool use block
    const toolUseBlock = message.content.find(
      (block): block is ToolUseBlock => block.type === "tool_use",
    );

    if (!toolUseBlock) {
      console.error(
        "No tool_use block in response:",
        JSON.stringify(message.content),
      );
      return new Response(
        JSON.stringify({
          error: "AI model did not return structured recipes",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const input = toolUseBlock.input as {
      recipes: Omit<
        Recipe,
        "id" | "matchedIngredientCount" | "totalIngredientCount"
      >[];
    };

    if (!input.recipes || !Array.isArray(input.recipes)) {
      return new Response(
        JSON.stringify({ error: "AI returned invalid recipe structure" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Enrich recipes with IDs and computed match counts
    const recipes: Recipe[] = input.recipes.map((raw, index) => {
      const matchedCount = raw.ingredients.filter((ing) => {
        const normalizedName = ing.name.trim().toLowerCase();
        return ingredientNames.has(normalizedName) || ing.fromPhoto;
      }).length;

      return {
        id: `recipe-${Date.now()}-${index}`,
        title: raw.title,
        description: raw.description,
        servings: raw.servings,
        prepTimeMinutes: raw.prepTimeMinutes,
        cookTimeMinutes: raw.cookTimeMinutes,
        tags: raw.tags,
        matchedIngredientCount: matchedCount,
        totalIngredientCount: raw.ingredients.length,
        ingredients: raw.ingredients.map((ing) => ({
          name: ing.name.trim().toLowerCase(),
          quantity: String(ing.quantity),
          unit: ing.unit,
          fromPhoto:
            ing.fromPhoto ||
            ingredientNames.has(ing.name.trim().toLowerCase()),
        })),
        steps: raw.steps.map((step, i) => ({
          order: step.order ?? i + 1,
          instruction: step.instruction,
        })),
      };
    });

    // Check if we got enough novel recipes vs what was already shown
    const novelRecipes = recipes.filter(
      (r) =>
        !shown.some(
          (title) =>
            title.toLowerCase().trim() === r.title.toLowerCase().trim(),
        ),
    );

    const noMoreRecipes = novelRecipes.length === 0 && shown.length > 0;

    return new Response(
      JSON.stringify({
        recipes: novelRecipes.length > 0 ? novelRecipes : recipes,
        noMoreRecipes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-recipes error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status =
      msg.includes("401") || msg.includes("authentication") ? 401 : 500;
    return new Response(
      JSON.stringify({ error: `Recipe generation failed: ${msg}` }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
