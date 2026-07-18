import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "npm:@anthropic-ai/sdk@0.39";
import { handleRequest } from "./handler.ts";

Deno.serve((req) =>
  handleRequest(req, {
    getApiKey: () => Deno.env.get("ANTHROPIC_API_KEY"),
    createClient: (apiKey) => new Anthropic({ apiKey }),
  }),
);
