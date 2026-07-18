/**
 * API layer — calls Supabase Edge Functions backed by Claude AI.
 *
 * detect-ingredients: photo → compress → base64 → Claude vision → ingredient list
 * generate-recipes:   ingredients → Claude tool use → structured recipes
 */
import { File } from "expo-file-system";
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

/** Prefer server-provided friendly copy; fall back by status. */
function friendlyMessage(status: number, serverMessage: string | null): string {
  if (serverMessage && !looksTechnical(serverMessage)) {
    return serverMessage;
  }

  switch (status) {
    case 400:
    case 402:
      return "We're temporarily out of AI credits. Add funds in the Anthropic console, then try again.";
    case 401:
      return "AI service authentication failed. Check that the API key is set correctly.";
    case 429:
      return "Too many requests right now. Wait a moment and try again.";
    case 503:
      return "The AI is busy right now. Please try again in a moment.";
    case 502:
      return "Something went wrong while talking to the AI. Please try again.";
    default:
      return serverMessage ?? "Something went wrong. Please try again.";
  }
}

function looksTechnical(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("error code:") ||
    lower.includes("invalid_request") ||
    lower.includes("authentication_error") ||
    lower.includes("not_found_error") ||
    lower.includes("rate_limit_error") ||
    /status \d{3}/.test(lower) ||
    lower.startsWith("ingredient detection failed:") ||
    lower.startsWith("recipe generation failed:")
  );
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
  } catch {
    throw new ApiError(
      "Could not connect to the server. Check your internet connection and try again.",
      0,
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(friendlyMessage(response.status, null), response.status);
  }

  if (!response.ok) {
    const serverMessage =
      typeof data.error === "string" ? data.error : null;
    throw new ApiError(
      friendlyMessage(response.status, serverMessage),
      response.status,
    );
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
  const imageBase64 = await new File(compressedUri).base64();

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
