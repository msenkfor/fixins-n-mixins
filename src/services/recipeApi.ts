/**
 * API layer — calls Supabase Edge Functions backed by Claude AI.
 *
 * detect-ingredients: photo → Claude vision → ingredient list
 * generate-recipes:   ingredients → Claude tool use → structured recipes
 */
import * as FileSystem from "expo-file-system";
import { DetectedIngredient, Recipe } from "../types/recipe";

// In development, use the local Supabase instance.
// For production, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function callFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return data as T;
}

/**
 * Detect ingredients from a photo URI via Claude vision.
 * Reads the image as base64, sends to /detect-ingredients edge function.
 */
export async function detectIngredients(
  photoUri: string,
): Promise<DetectedIngredient[]> {
  // Read image as base64
  const imageBase64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine MIME type from URI extension
  const ext = photoUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  const mimeType = mimeMap[ext] ?? "image/jpeg";

  const result = await callFunction<{ ingredients: DetectedIngredient[] }>(
    "detect-ingredients",
    { imageBase64, mimeType },
  );
  return result.ingredients;
}

/**
 * Generate recipes from a list of ingredients.
 * Calls /generate-recipes edge function with dedup via excludeTitles.
 */
export async function generateRecipes(
  ingredients: DetectedIngredient[],
  excludeTitles: string[] = [],
): Promise<Recipe[]> {
  const result = await callFunction<{
    recipes: Recipe[];
    noMoreRecipes: boolean;
  }>("generate-recipes", {
    ingredients,
    shownRecipeTitles: excludeTitles,
  });
  return result.recipes;
}

/**
 * Generate a fresh batch of recipes, excluding previously shown titles.
 * Returns empty array when the model can't produce novel recipes.
 */
export async function refreshRecipes(
  ingredients: DetectedIngredient[],
  excludeTitles: string[] = [],
): Promise<Recipe[]> {
  const result = await callFunction<{
    recipes: Recipe[];
    noMoreRecipes: boolean;
  }>("generate-recipes", {
    ingredients,
    shownRecipeTitles: excludeTitles,
  });

  if (result.noMoreRecipes) {
    return [];
  }
  return result.recipes;
}
