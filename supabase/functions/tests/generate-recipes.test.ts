import {
  assertEquals,
  assertStringIncludes,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleRequest } from "../generate-recipes/handler.ts";
import {
  mockClientWithToolResponse,
  mockClientNoApiKey,
  mockClientThatThrows,
  makePostRequest,
  makeOptionsRequest,
  makeRecipePayload,
  parseResponse,
} from "./helpers.ts";

const VALID_INGREDIENTS = [
  { name: "chicken breast", quantity: "2 lbs" },
  { name: "bell pepper", quantity: "3" },
  { name: "garlic" },
];

function makeToolInput(count = 1, overrides: Record<string, unknown> = {}) {
  return {
    recipes: Array.from({ length: count }, (_, i) =>
      makeRecipePayload({ title: `Recipe ${i + 1}`, ...overrides }),
    ),
  };
}

// ── CORS ────────────────────────────────────────────────────────────

Deno.test("OPTIONS returns CORS headers", async () => {
  const deps = mockClientWithToolResponse(makeToolInput());
  const res = await handleRequest(makeOptionsRequest(), deps);

  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

// ── Input validation ────────────────────────────────────────────────

Deno.test("returns 400 when ingredients is missing", async () => {
  const deps = mockClientWithToolResponse(makeToolInput());
  const res = await handleRequest(makePostRequest({}), deps);

  assertEquals(res.status, 400);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "ingredients");
});

Deno.test("returns 400 when ingredients is empty array", async () => {
  const deps = mockClientWithToolResponse(makeToolInput());
  const res = await handleRequest(
    makePostRequest({ ingredients: [] }),
    deps,
  );

  assertEquals(res.status, 400);
});

Deno.test("returns 400 when ingredients is not an array", async () => {
  const deps = mockClientWithToolResponse(makeToolInput());
  const res = await handleRequest(
    makePostRequest({ ingredients: "chicken" }),
    deps,
  );

  assertEquals(res.status, 400);
});

// ── API key ─────────────────────────────────────────────────────────

Deno.test("returns 500 when API key is not configured", async () => {
  const deps = mockClientNoApiKey();
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 500);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "missing API key");
});

// ── Successful generation ───────────────────────────────────────────

Deno.test("returns enriched recipes from tool_use response", async () => {
  const deps = mockClientWithToolResponse(makeToolInput(2));
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{
    recipes: Array<{
      id: string;
      title: string;
      matchedIngredientCount: number;
      totalIngredientCount: number;
    }>;
    noMoreRecipes: boolean;
  }>(res);

  assertEquals(body.recipes.length, 2);
  assertEquals(body.noMoreRecipes, false);

  // Each recipe should have a generated ID
  assert(body.recipes[0].id.startsWith("recipe-"));
  assert(body.recipes[1].id.startsWith("recipe-"));

  // IDs should be unique
  assert(body.recipes[0].id !== body.recipes[1].id);
});

Deno.test("computes matchedIngredientCount from user ingredients", async () => {
  const toolInput = {
    recipes: [
      makeRecipePayload({
        ingredients: [
          { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
          { name: "bell pepper", quantity: "2", unit: "whole", fromPhoto: true },
          { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
          { name: "olive oil", quantity: "2", unit: "tbsp", fromPhoto: false },
        ],
      }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{
    recipes: Array<{
      matchedIngredientCount: number;
      totalIngredientCount: number;
    }>;
  }>(res);

  // chicken breast + bell pepper are from photo; salt + olive oil are not
  assertEquals(body.recipes[0].matchedIngredientCount, 2);
  assertEquals(body.recipes[0].totalIngredientCount, 4);
});

Deno.test("normalizes ingredient names to lowercase", async () => {
  const toolInput = {
    recipes: [
      makeRecipePayload({
        ingredients: [
          {
            name: "  Chicken Breast  ",
            quantity: "1",
            unit: "lb",
            fromPhoto: true,
          },
        ],
      }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{ ingredients: Array<{ name: string }> }>;
  }>(res);

  assertEquals(body.recipes[0].ingredients[0].name, "chicken breast");
});

Deno.test("corrects fromPhoto based on user ingredient list", async () => {
  // Claude says fromPhoto: false, but garlic IS in the user's list
  const toolInput = {
    recipes: [
      makeRecipePayload({
        ingredients: [
          { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: false },
        ],
      }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{
      ingredients: Array<{ name: string; fromPhoto: boolean }>;
    }>;
  }>(res);

  // Should be corrected to true since garlic is in VALID_INGREDIENTS
  assertEquals(body.recipes[0].ingredients[0].fromPhoto, true);
});

Deno.test("assigns step order when missing", async () => {
  const toolInput = {
    recipes: [
      makeRecipePayload({
        steps: [
          // deno-lint-ignore no-explicit-any
          { instruction: "First step" } as any,
          // deno-lint-ignore no-explicit-any
          { instruction: "Second step" } as any,
        ],
      }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{ steps: Array<{ order: number }> }>;
  }>(res);

  assertEquals(body.recipes[0].steps[0].order, 1);
  assertEquals(body.recipes[0].steps[1].order, 2);
});

// ── Deduplication ───────────────────────────────────────────────────

Deno.test("filters out recipes whose titles match shownRecipeTitles", async () => {
  const toolInput = {
    recipes: [
      makeRecipePayload({ title: "Chicken Stir-Fry" }),
      makeRecipePayload({ title: "Garlic Rice" }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({
      ingredients: VALID_INGREDIENTS,
      shownRecipeTitles: ["Chicken Stir-Fry"],
    }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{ title: string }>;
    noMoreRecipes: boolean;
  }>(res);

  assertEquals(body.recipes.length, 1);
  assertEquals(body.recipes[0].title, "Garlic Rice");
  assertEquals(body.noMoreRecipes, false);
});

Deno.test("dedup is case-insensitive", async () => {
  const toolInput = {
    recipes: [makeRecipePayload({ title: "Chicken Stir-Fry" })],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({
      ingredients: VALID_INGREDIENTS,
      shownRecipeTitles: ["chicken stir-fry"],
    }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{ title: string }>;
    noMoreRecipes: boolean;
  }>(res);

  // All recipes filtered out → noMoreRecipes should be true,
  // but it returns the originals as a fallback
  assertEquals(body.noMoreRecipes, true);
});

Deno.test("returns noMoreRecipes=true when all recipes match shown titles", async () => {
  const toolInput = {
    recipes: [
      makeRecipePayload({ title: "Recipe A" }),
      makeRecipePayload({ title: "Recipe B" }),
    ],
  };
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({
      ingredients: VALID_INGREDIENTS,
      shownRecipeTitles: ["Recipe A", "Recipe B"],
    }),
    deps,
  );

  const body = await parseResponse<{
    recipes: Array<{ title: string }>;
    noMoreRecipes: boolean;
  }>(res);

  assertEquals(body.noMoreRecipes, true);
  // Falls back to returning the recipes anyway
  assertEquals(body.recipes.length, 2);
});

Deno.test("works when shownRecipeTitles is omitted", async () => {
  const toolInput = makeToolInput(2);
  const deps = mockClientWithToolResponse(toolInput);
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const body = await parseResponse<{
    recipes: unknown[];
    noMoreRecipes: boolean;
  }>(res);

  assertEquals(body.recipes.length, 2);
  assertEquals(body.noMoreRecipes, false);
});

// ── Prompt construction ─────────────────────────────────────────────

Deno.test("includes ingredient quantities in prompt", async () => {
  let capturedParams: Record<string, unknown> = {};
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (params: unknown) => {
          capturedParams = params as Record<string, unknown>;
          return {
            content: [
              {
                type: "tool_use" as const,
                id: "test",
                name: "save_recipes",
                input: makeToolInput(1),
              },
            ],
          };
        },
      },
    }),
  };

  await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const messages = capturedParams.messages as Array<{ content: string }>;
  const prompt = messages[0].content as string;
  assertStringIncludes(prompt, "chicken breast (2 lbs)");
  assertStringIncludes(prompt, "bell pepper (3)");
  assertStringIncludes(prompt, "garlic"); // no quantity
});

Deno.test("includes exclusion clause when shownRecipeTitles provided", async () => {
  let capturedParams: Record<string, unknown> = {};
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (params: unknown) => {
          capturedParams = params as Record<string, unknown>;
          return {
            content: [
              {
                type: "tool_use" as const,
                id: "test",
                name: "save_recipes",
                input: makeToolInput(1),
              },
            ],
          };
        },
      },
    }),
  };

  await handleRequest(
    makePostRequest({
      ingredients: VALID_INGREDIENTS,
      shownRecipeTitles: ["Old Recipe"],
    }),
    deps,
  );

  const messages = capturedParams.messages as Array<{ content: string }>;
  const prompt = messages[0].content as string;
  assertStringIncludes(prompt, "Do NOT suggest");
  assertStringIncludes(prompt, "Old Recipe");
});

Deno.test("forces tool_choice to save_recipes", async () => {
  let capturedParams: Record<string, unknown> = {};
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (params: unknown) => {
          capturedParams = params as Record<string, unknown>;
          return {
            content: [
              {
                type: "tool_use" as const,
                id: "test",
                name: "save_recipes",
                input: makeToolInput(1),
              },
            ],
          };
        },
      },
    }),
  };

  await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  const toolChoice = capturedParams.tool_choice as { type: string; name: string };
  assertEquals(toolChoice.type, "tool");
  assertEquals(toolChoice.name, "save_recipes");
});

// ── Error handling ──────────────────────────────────────────────────

Deno.test("returns 502 when Claude returns no tool_use block", async () => {
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (_params: unknown) => ({
          content: [{ type: "text", text: "I can't use tools" }],
        }),
      },
    }),
  };

  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 502);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "did not return structured");
});

Deno.test("returns 502 when tool input has no recipes array", async () => {
  const deps = mockClientWithToolResponse({ notRecipes: [] });
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 502);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "invalid recipe structure");
});

Deno.test("returns 401 when Anthropic returns authentication error", async () => {
  const deps = mockClientThatThrows(
    new Error("401 authentication_error"),
  );
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 401);
});

Deno.test("returns 500 for generic Anthropic errors", async () => {
  const deps = mockClientThatThrows(new Error("overloaded_error"));
  const res = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    deps,
  );

  assertEquals(res.status, 500);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "overloaded_error");
});

// ── CORS on all responses ───────────────────────────────────────────

Deno.test("all error responses include CORS headers", async () => {
  // 400
  const res400 = await handleRequest(
    makePostRequest({}),
    mockClientWithToolResponse(makeToolInput()),
  );
  assertEquals(res400.headers.get("Access-Control-Allow-Origin"), "*");

  // 500 (no key)
  const res500 = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    mockClientNoApiKey(),
  );
  assertEquals(res500.headers.get("Access-Control-Allow-Origin"), "*");

  // 502 (no tool block)
  const res502 = await handleRequest(
    makePostRequest({ ingredients: VALID_INGREDIENTS }),
    {
      getApiKey: () => "test-key",
      createClient: (_apiKey: string) => ({
        messages: {
          create: async (_params: unknown) => ({
            content: [{ type: "text", text: "no tool" }],
          }),
        },
      }),
    },
  );
  assertEquals(res502.headers.get("Access-Control-Allow-Origin"), "*");
});
