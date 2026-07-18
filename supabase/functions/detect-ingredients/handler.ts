import { corsHeaders } from "../_shared/cors.ts";

interface DetectedIngredient {
  name: string;
  quantity?: string;
}

interface AnthropicClient {
  messages: {
    create(params: unknown): Promise<{
      content: Array<{ type: string; text?: string }>;
    }>;
  };
}

export interface HandlerDeps {
  getApiKey: () => string | undefined;
  createClient: (apiKey: string) => AnthropicClient;
}

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
    const { imageBase64, mimeType } = body as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing required field: imageBase64" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const mediaType = (mimeType || "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    const client = deps.createClient(apiKey);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Look at this photo and identify all food ingredients visible. For each ingredient, provide:
- "name": a common grocery name (lowercase, e.g. "chicken breast", "bell pepper")
- "quantity": an estimated amount if visible (e.g. "2 lbs", "3", "1 bunch"), or omit if unclear

Return ONLY a JSON array of objects. No markdown, no explanation, just the JSON array.
Example: [{"name": "chicken breast", "quantity": "2 lbs"}, {"name": "garlic"}]

If no food ingredients are visible, return an empty array: []`,
            },
          ],
        },
      ],
    });

    // Extract text content from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text" || !textBlock.text) {
      return new Response(
        JSON.stringify({ error: "No text response from AI model" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse the JSON from Claude's response
    let ingredients: DetectedIngredient[];
    try {
      // Strip any markdown code fences Claude might wrap around the JSON
      const cleaned = textBlock.text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      ingredients = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude response:", textBlock.text);
      return new Response(
        JSON.stringify({
          error: "Failed to parse ingredient detection response",
          raw: textBlock.text,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate shape — ensure it's an array of objects with at least a name
    if (!Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: "AI returned non-array response" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const validated: DetectedIngredient[] = ingredients
      .filter(
        (item) =>
          item &&
          typeof item.name === "string" &&
          item.name.trim().length > 0,
      )
      .map((item) => ({
        name: item.name.trim().toLowerCase(),
        ...(item.quantity ? { quantity: String(item.quantity).trim() } : {}),
      }));

    return new Response(JSON.stringify({ ingredients: validated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("detect-ingredients error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status =
      msg.includes("401") || msg.includes("authentication") ? 401 : 500;
    return new Response(
      JSON.stringify({ error: `Ingredient detection failed: ${msg}` }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
