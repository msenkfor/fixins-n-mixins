import { ANTHROPIC_MODEL } from "../_shared/config.ts";
import {
  corsPreflightResponse,
  jsonResponse,
  errorResponse,
  mapUpstreamError,
} from "../_shared/response.ts";
import type { HandlerDeps } from "../_shared/types.ts";
import {
  DETECTION_PROMPT,
  type ImageMediaType,
  normalizeIngredients,
  stripCodeFences,
} from "./parse.ts";

export type { HandlerDeps };

/**
 * Detect food ingredients from a base64 image via Claude vision.
 * Expects JSON body: `{ imageBase64: string, mimeType?: string }`.
 */
export async function handleRequest(
  req: Request,
  deps: HandlerDeps,
): Promise<Response> {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  try {
    const apiKey = deps.getApiKey();
    if (!apiKey) return errorResponse("Server misconfiguration: missing API key", 500);

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return errorResponse("Missing required field: imageBase64", 400);
    }

    const mediaType: ImageMediaType = (mimeType || "image/jpeg") as ImageMediaType;
    const client = deps.createClient(apiKey);

    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: DETECTION_PROMPT },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text" || !("text" in textBlock)) {
      return errorResponse("No text response from AI model", 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences((textBlock as { text: string }).text));
    } catch {
      const raw = (textBlock as { text: string }).text;
      console.error("Failed to parse Claude response:", raw);
      return jsonResponse({ error: "Failed to parse ingredient detection response", raw }, 502);
    }

    if (!Array.isArray(parsed)) {
      return errorResponse("AI returned non-array response", 502);
    }

    return jsonResponse({ ingredients: normalizeIngredients(parsed) });
  } catch (error) {
    console.error("detect-ingredients error:", error);
    const mapped = mapUpstreamError(error, "detect");
    return errorResponse(mapped.message, mapped.status);
  }
}
