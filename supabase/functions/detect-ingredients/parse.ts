import type { DetectedIngredient } from "../_shared/types.ts";

export const DETECTION_PROMPT = `Look at this photo and identify all food ingredients visible. For each ingredient, provide:
- "name": a common grocery name (lowercase, e.g. "chicken breast", "bell pepper")
- "quantity": an estimated amount if visible (e.g. "2 lbs", "3", "1 bunch"), or omit if unclear

Return ONLY a JSON array of objects. No markdown, no explanation, just the JSON array.
Example: [{"name": "chicken breast", "quantity": "2 lbs"}, {"name": "garlic"}]

If no food ingredients are visible, return an empty array: []`;

export type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

/** Strip markdown code fences that Claude sometimes wraps around JSON. */
export function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/** Validate and normalize raw ingredient data from Claude. */
export function normalizeIngredients(
  raw: unknown[],
): DetectedIngredient[] {
  return raw
    .filter(
      (item): item is { name: string; quantity?: unknown } =>
        !!item &&
        typeof (item as Record<string, unknown>).name === "string" &&
        ((item as Record<string, unknown>).name as string).trim().length > 0,
    )
    .map((item) => ({
      name: item.name.trim().toLowerCase(),
      ...(item.quantity ? { quantity: String(item.quantity).trim() } : {}),
    }));
}
