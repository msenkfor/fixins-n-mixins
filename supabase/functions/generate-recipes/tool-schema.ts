import { RECIPE_COUNT } from "../_shared/config.ts";

/**
 * Tool definition that forces Claude to return schema-compliant recipes.
 * Defined as a standalone constant so the handler stays focused on logic.
 */
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
              description: "Recipe title, capitalized (e.g. 'Chicken Stir-Fry')",
            },
            description: {
              type: "string",
              description: "One-sentence description of the dish (under 80 chars)",
            },
            servings: { type: "number", description: "Number of servings" },
            prepTimeMinutes: { type: "number", description: "Prep time in minutes" },
            cookTimeMinutes: { type: "number", description: "Cook time in minutes" },
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
                  name: { type: "string", description: "Ingredient name, lowercase" },
                  quantity: { type: "string", description: "Numeric quantity as string (e.g. '2', '0.5')" },
                  unit: { type: "string", description: "Unit of measurement (e.g. 'lbs', 'cups', 'tbsp', 'whole', 'cloves')" },
                  fromPhoto: { type: "boolean", description: "true if from the user's photo, false if a pantry staple" },
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
                  order: { type: "number", description: "Step number starting at 1" },
                  instruction: { type: "string", description: "Clear, concise instruction (1-2 sentences max)" },
                },
                required: ["order", "instruction"],
              },
            },
          },
          required: [
            "title", "description", "servings", "prepTimeMinutes",
            "cookTimeMinutes", "tags", "ingredients", "steps",
          ],
        },
      },
    },
    required: ["recipes"],
  },
} as const;
