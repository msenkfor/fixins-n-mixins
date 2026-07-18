/**
 * Shared test helpers — mock factories for Anthropic client and request builders.
 */

/** Build a mock Anthropic client that returns a text content block. */
export function mockClientWithTextResponse(text: string) {
  return {
    getApiKey: () => "test-api-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (_params: unknown) => ({
          content: [{ type: "text" as const, text }],
        }),
      },
    }),
  };
}

/** Build a mock Anthropic client that returns a tool_use content block. */
export function mockClientWithToolResponse(input: unknown) {
  return {
    getApiKey: () => "test-api-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (_params: unknown) => ({
          content: [
            {
              type: "tool_use" as const,
              id: "test-tool-call-id",
              name: "save_recipes",
              input,
            },
          ],
        }),
      },
    }),
  };
}

/** Build a mock deps object with no API key configured. */
export function mockClientNoApiKey() {
  return {
    getApiKey: () => undefined,
    createClient: (_apiKey: string) => {
      throw new Error("Should not be called");
    },
  };
}

/** Build a mock deps object where the Anthropic call throws. */
export function mockClientThatThrows(error: Error) {
  return {
    getApiKey: () => "test-api-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (_params: unknown) => {
          throw error;
        },
      },
    }),
  };
}

/** Build a POST Request with JSON body. */
export function makePostRequest(
  body: unknown,
  url = "http://localhost/test",
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Build an OPTIONS preflight request. */
export function makeOptionsRequest(url = "http://localhost/test"): Request {
  return new Request(url, { method: "OPTIONS" });
}

/** Parse a Response body as JSON. */
export async function parseResponse<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  return (await res.json()) as T;
}

/** A minimal valid recipe for use in mock tool responses. */
export function makeRecipePayload(overrides: Partial<{
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tags: string[];
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    fromPhoto: boolean;
  }>;
  steps: Array<{ order: number; instruction: string }>;
}> = {}) {
  return {
    title: overrides.title ?? "Test Recipe",
    description: overrides.description ?? "A test recipe description",
    servings: overrides.servings ?? 4,
    prepTimeMinutes: overrides.prepTimeMinutes ?? 10,
    cookTimeMinutes: overrides.cookTimeMinutes ?? 20,
    tags: overrides.tags ?? ["30-min"],
    ingredients: overrides.ingredients ?? [
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: overrides.steps ?? [
      { order: 1, instruction: "Cook the chicken." },
      { order: 2, instruction: "Season with salt." },
    ],
  };
}
