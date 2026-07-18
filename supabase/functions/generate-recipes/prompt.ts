import { RECIPE_COUNT } from "../_shared/config.ts";
import type { DetectedIngredient } from "../_shared/types.ts";

export function buildIngredientList(ingredients: DetectedIngredient[]): string {
  return ingredients
    .map((i) => (i.quantity ? `${i.name} (${i.quantity})` : i.name))
    .join(", ");
}

export function buildExclusionClause(shown: string[]): string {
  if (shown.length === 0) return "";
  const list = shown.map((t) => `- ${t}`).join("\n");
  return `\n\nDo NOT suggest any of these recipes (already shown to the user):\n${list}\n\nGenerate completely different recipes with different titles.`;
}

export function buildPrompt(
  ingredientList: string,
  exclusionClause: string,
): string {
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
