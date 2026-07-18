/**
 * API layer — calls Supabase Edge Functions backed by Claude AI.
 *
 * detect-ingredients: photo → compress → base64 → Claude vision → ingredient list
 * generate-recipes:   ingredients → Claude tool use → structured recipes
 */
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { DetectedIngredient, Recipe } from "../types/recipe";

// In development, use the local Supabase instance.
// For production, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/** Max dimension for compressed images (keeps base64 payload under ~1MB). */
const MAX_IMAGE_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

export class ApiError extends Error {
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

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure (no connection, DNS, timeout)
    throw new ApiError(
      "Could not connect to the server. Check your internet connection and try again.",
      0,
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `Server returned an invalid response (status ${response.status})`,
      response.status,
    );
  }

  if (!response.ok) {
    const message = typeof data.error === "string"
      ? data.error
      : `Request failed (status ${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/**
 * Compress a photo to JPEG at max 1024px on the longest side.
 * Returns the URI of the compressed image.
 */
async function compressPhoto(photoUri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ resize: { width: MAX_IMAGE_DIMENSION } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

/**
 * Detect ingredients from a photo URI via Claude vision.
 * Compresses the image, reads as base64, sends to /detect-ingredients.
 */
export async function detectIngredients(
  photoUri: string,
): Promise<DetectedIngredient[]> {
  // Compress before encoding — raw camera photos can be 5-10MB
  const compressedUri = await compressPhoto(photoUri);

  const imageBase64 = await FileSystem.readAsStringAsync(compressedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const result = await callFunction<{ ingredients: DetectedIngredient[] }>(
    "detect-ingredients",
    { imageBase64, mimeType: "image/jpeg" },
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
