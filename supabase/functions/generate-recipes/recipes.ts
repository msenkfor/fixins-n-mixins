import type { RawRecipe, Recipe } from "../_shared/types.ts";

/** Attach match counts and normalize ingredient fields from the model output. */
export function enrichRecipes(
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

/** Drop recipes the user has already seen; flag when none are novel. */
export function dedup(
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
