/**
 * Stub API layer — returns mock data with simulated network delay.
 * Replace internals with real Supabase Edge Function calls when ready.
 */
import { DetectedIngredient, Recipe } from "../types/recipe";
import { MOCK_INGREDIENTS, MOCK_RECIPES_SET_A, MOCK_RECIPES_SET_B } from "../data/mockData";

const FAKE_DELAY_MS = 2000;

let currentSet: "A" | "B" = "A";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stub: detect ingredients from a photo URI.
 * In production, this sends the image to /detect-ingredients.
 */
export async function detectIngredients(
  _photoUri: string
): Promise<DetectedIngredient[]> {
  await delay(FAKE_DELAY_MS);
  return [...MOCK_INGREDIENTS];
}

/**
 * Stub: generate recipes from a list of ingredients.
 * Returns 5 mock recipes. In production, this calls /generate-recipes.
 */
export async function generateRecipes(
  _ingredients: DetectedIngredient[],
  _excludeTitles: string[] = []
): Promise<Recipe[]> {
  await delay(FAKE_DELAY_MS);
  currentSet = "A";
  return [...MOCK_RECIPES_SET_A];
}

/**
 * Stub: generate a fresh batch of recipes (dedup'd against shown titles).
 * Returns a different set of 5 recipes to simulate "More Recipes".
 */
export async function refreshRecipes(
  _ingredients: DetectedIngredient[],
  _excludeTitles: string[] = []
): Promise<Recipe[]> {
  await delay(FAKE_DELAY_MS);
  if (currentSet === "A") {
    currentSet = "B";
    return [...MOCK_RECIPES_SET_B];
  }
  // After both sets shown, return empty to signal no more
  return [];
}
