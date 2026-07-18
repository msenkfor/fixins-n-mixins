import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleRequest } from "../detect-ingredients/handler.ts";
import {
  mockClientWithTextResponse,
  mockClientNoApiKey,
  mockClientThatThrows,
  makePostRequest,
  makeOptionsRequest,
  parseResponse,
} from "./helpers.ts";

// ── CORS ────────────────────────────────────────────────────────────

Deno.test("OPTIONS returns CORS headers", async () => {
  const deps = mockClientWithTextResponse("[]");
  const res = await handleRequest(makeOptionsRequest(), deps);

  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
  assertStringIncludes(
    res.headers.get("Access-Control-Allow-Headers") ?? "",
    "content-type",
  );
});

// ── Input validation ────────────────────────────────────────────────

Deno.test("returns 400 when imageBase64 is missing", async () => {
  const deps = mockClientWithTextResponse("[]");
  const res = await handleRequest(makePostRequest({}), deps);

  assertEquals(res.status, 400);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "imageBase64");
});

Deno.test("returns 400 when imageBase64 is not a string", async () => {
  const deps = mockClientWithTextResponse("[]");
  const res = await handleRequest(
    makePostRequest({ imageBase64: 12345 }),
    deps,
  );

  assertEquals(res.status, 400);
});

Deno.test("returns 400 when imageBase64 is empty string", async () => {
  const deps = mockClientWithTextResponse("[]");
  const res = await handleRequest(
    makePostRequest({ imageBase64: "" }),
    deps,
  );

  assertEquals(res.status, 400);
});

// ── API key ─────────────────────────────────────────────────────────

Deno.test("returns 500 when API key is not configured", async () => {
  const deps = mockClientNoApiKey();
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 500);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "missing API key");
});

// ── Successful detection ────────────────────────────────────────────

Deno.test("returns parsed ingredients from clean JSON response", async () => {
  const deps = mockClientWithTextResponse(
    '[{"name":"Chicken Breast","quantity":"2 lbs"},{"name":"Garlic"}]',
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{ ingredients: Array<{ name: string; quantity?: string }> }>(res);
  assertEquals(body.ingredients.length, 2);
  assertEquals(body.ingredients[0].name, "chicken breast"); // lowercased
  assertEquals(body.ingredients[0].quantity, "2 lbs");
  assertEquals(body.ingredients[1].name, "garlic");
  assertEquals(body.ingredients[1].quantity, undefined); // omitted when absent
});

Deno.test("strips markdown code fences from Claude response", async () => {
  const deps = mockClientWithTextResponse(
    '```json\n[{"name":"tomato","quantity":"3"}]\n```',
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{ ingredients: Array<{ name: string }> }>(res);
  assertEquals(body.ingredients.length, 1);
  assertEquals(body.ingredients[0].name, "tomato");
});

Deno.test("returns empty array when no ingredients detected", async () => {
  const deps = mockClientWithTextResponse("[]");
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{ ingredients: unknown[] }>(res);
  assertEquals(body.ingredients.length, 0);
});

Deno.test("filters out items with empty or missing names", async () => {
  const deps = mockClientWithTextResponse(
    '[{"name":"onion"},{"name":""},{"name":"  "},{"quantity":"5"}]',
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{ ingredients: Array<{ name: string }> }>(res);
  assertEquals(body.ingredients.length, 1);
  assertEquals(body.ingredients[0].name, "onion");
});

Deno.test("normalizes ingredient names to lowercase and trimmed", async () => {
  const deps = mockClientWithTextResponse(
    '[{"name":"  Bell Pepper  ","quantity":" 2 "}]',
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 200);
  const body = await parseResponse<{ ingredients: Array<{ name: string; quantity: string }> }>(res);
  assertEquals(body.ingredients[0].name, "bell pepper");
  assertEquals(body.ingredients[0].quantity, "2");
});

Deno.test("uses provided mimeType", async () => {
  let capturedParams: Record<string, unknown> = {};
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (params: unknown) => {
          capturedParams = params as Record<string, unknown>;
          return { content: [{ type: "text" as const, text: "[]" }] };
        },
      },
    }),
  };

  await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==", mimeType: "image/png" }),
    deps,
  );

  // Verify the image block used the provided MIME type
  const messages = capturedParams.messages as Array<{ content: Array<{ source?: { media_type: string } }> }>;
  const imageBlock = messages[0].content[0];
  assertEquals(imageBlock.source?.media_type, "image/png");
});

Deno.test("defaults mimeType to image/jpeg when not provided", async () => {
  let capturedParams: Record<string, unknown> = {};
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (params: unknown) => {
          capturedParams = params as Record<string, unknown>;
          return { content: [{ type: "text" as const, text: "[]" }] };
        },
      },
    }),
  };

  await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  const messages = capturedParams.messages as Array<{ content: Array<{ source?: { media_type: string } }> }>;
  const imageBlock = messages[0].content[0];
  assertEquals(imageBlock.source?.media_type, "image/jpeg");
});

// ── Error handling ──────────────────────────────────────────────────

Deno.test("returns 502 when Claude returns no text block", async () => {
  const deps = {
    getApiKey: () => "test-key",
    createClient: (_apiKey: string) => ({
      messages: {
        create: async (_params: unknown) => ({
          content: [{ type: "tool_use" }], // no text block
        }),
      },
    }),
  };

  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 502);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "No text response");
});

Deno.test("returns 502 when Claude returns unparseable text", async () => {
  const deps = mockClientWithTextResponse("this is not json at all");
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 502);
  const body = await parseResponse<{ error: string; raw: string }>(res);
  assertStringIncludes(body.error, "Failed to parse");
  assertEquals(body.raw, "this is not json at all");
});

Deno.test("returns 502 when Claude returns non-array JSON", async () => {
  const deps = mockClientWithTextResponse('{"not": "an array"}');
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 502);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "non-array");
});

Deno.test("returns 401 when Anthropic returns authentication error", async () => {
  const deps = mockClientThatThrows(
    new Error("401 authentication_error"),
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 401);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "authentication");
});

Deno.test("returns 402 with friendly message when Anthropic credit balance is low", async () => {
  const deps = mockClientThatThrows(
    new Error(
      "400 {\"type\":\"error\",\"error\":{\"type\":\"invalid_request_error\",\"message\":\"Your credit balance is too low\"}}",
    ),
  );
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 402);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "AI credits");
});

Deno.test("returns 429 with friendly message on rate limit", async () => {
  const deps = mockClientThatThrows(new Error("429 rate_limit_error"));
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 429);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "Too many requests");
});

Deno.test("returns friendly message for generic Anthropic errors", async () => {
  const deps = mockClientThatThrows(new Error("something exploded"));
  const res = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    deps,
  );

  assertEquals(res.status, 500);
  const body = await parseResponse(res);
  assertStringIncludes(body.error as string, "couldn't identify ingredients");
});

// ── CORS on all responses ───────────────────────────────────────────

Deno.test("all error responses include CORS headers", async () => {
  // 400
  const res400 = await handleRequest(
    makePostRequest({}),
    mockClientWithTextResponse("[]"),
  );
  assertEquals(res400.headers.get("Access-Control-Allow-Origin"), "*");

  // 500 (no key)
  const res500 = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    mockClientNoApiKey(),
  );
  assertEquals(res500.headers.get("Access-Control-Allow-Origin"), "*");

  // 502 (bad response)
  const res502 = await handleRequest(
    makePostRequest({ imageBase64: "dGVzdA==" }),
    mockClientWithTextResponse("not json"),
  );
  assertEquals(res502.headers.get("Access-Control-Allow-Origin"), "*");
});
