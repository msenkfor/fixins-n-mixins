import { corsHeaders } from "./cors.ts";

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

/** Return a JSON success response with CORS headers. */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

/** Return a JSON error response with CORS headers. */
export function errorResponse(error: string, status: number): Response {
  return jsonResponse({ error }, status);
}

/** Return an OPTIONS preflight response. */
export function corsPreflightResponse(): Response {
  return new Response("ok", { headers: corsHeaders });
}

/**
 * Map a caught error to an HTTP status code.
 * 401/authentication errors → 401, everything else → 500.
 */
export function statusFromError(error: unknown): number {
  const msg = error instanceof Error ? error.message : "";
  return msg.includes("401") || msg.includes("authentication") ? 401 : 500;
}
