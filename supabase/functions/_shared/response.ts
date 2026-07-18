import { corsHeaders } from "./cors.ts";

export { mapUpstreamError, statusFromError } from "./errors.ts";
export type { MappedError } from "./errors.ts";

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
