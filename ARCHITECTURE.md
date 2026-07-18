# Fixins-n-Mixins — Architecture & Technical Decisions

## Tech Stack — What and Why

| Layer | Choice | Signal |
|---|---|---|
| **Client** | Expo (React Native) + TypeScript | Cross-platform from day 1 without maintaining two codebases. Expo's managed workflow eliminates native build complexity for a POC. TypeScript catches schema drift between API responses and UI early. |
| **Navigation** | expo-router (file-based) | Convention over configuration. Route structure maps 1:1 to screens, which makes the app's information architecture legible from the file tree alone. |
| **State** | React Context | The state shape is small and session-scoped (ingredients, 5 recipes, shown-titles set). No persistence, no cross-tab sync, no time-travel debugging needed — Context is the lightest tool that fits. Adding Redux or Zustand here would be premature abstraction. |
| **Backend** | Supabase Edge Functions | Holds the API key server-side (non-negotiable for any shared build). Edge Functions are Deno-based, deploy globally, and cold-start in <50ms. Supabase also gives you Auth + Postgres + Storage as zero-config additions when the app grows past POC — avoids a platform migration later. |
| **AI** | Anthropic Claude (vision + structured output) | Single model handles both tasks: image→ingredients (vision) and ingredients→recipes (structured JSON via tool use). Tool use forces schema compliance — the client never parses free text. One vendor, one billing relationship, one failure mode to handle. |
| **Image handling** | expo-image-manipulator | Resize/compress client-side before upload. Keeps payload under ~1MB, reduces latency and token cost. The alternative (send full-res, let the server resize) wastes bandwidth on mobile networks. |

**The one-sentence pitch:** Every choice is the lightest tool that solves the current problem while leaving a clear upgrade path — no premature optimization, no lock-in that can't be walked back.

## Architectural Decisions — High-Level Design

**Architecture:** Client → Edge Function → Anthropic API. Two endpoints, one context boundary.

```
┌─────────────┐       ┌──────────────────────┐       ┌───────────┐
│  Expo App   │──────▶│ Supabase Edge Fn     │──────▶│ Anthropic │
│ (RN client) │◀──────│ /detect-ingredients  │◀──────│   API     │
│             │──────▶│ /generate-recipes    │──────▶│           │
└─────────────┘       └──────────────────────┘       └───────────┘
```

### Key decisions and their signals

1. **Two separate endpoints, not one combined "photo→recipes" call.**
   *Signal:* Separation of concerns. Detection can fail independently of generation. The user can correct misdetected ingredients before recipes are generated (reduces wasted API calls). Each endpoint has a single responsibility and a testable contract.

2. **Structured output via tool use, not prompt-and-pray.**
   *Signal:* The UI renders structured cards — it needs guaranteed schema compliance. Tool use / forced JSON mode means the client code has no parsing logic, no regex extraction, no "what if the model returns markdown instead." The contract is typed end-to-end: TypeScript interface ↔ API schema ↔ tool definition.

3. **Session state lives in the client, not the server.**
   *Signal:* The server is stateless — any edge function instance can serve any request. No session affinity, no DB writes on the hot path. The "shown recipes" dedup list is small (titles array) and ephemeral — it resets on new photo. Shipping it with each request is cheaper than maintaining server-side session state for a POC with no auth.

4. **Supabase over a standalone Express server.**
   *Signal:* The backend's only job today is "hold a key, forward a call." But the product roadmap clearly points toward auth + persistence (saved recipes, user accounts). Starting on Supabase means adding those features is a configuration change, not a platform migration. The cost is mild over-provisioning today; the payoff is zero-friction growth.

## Technical Trade-offs — What We Chose Not To Do

| Decision | What you gave up | Why it's defensible | Production-ize path |
|---|---|---|---|
| No caching layer | Every refresh hits the API ($) | POC validates the loop; caching adds complexity and staleness bugs. Users *want* fresh recipes. | Add Redis/KV cache keyed on `hash(ingredients)` with short TTL for the detection step only. |
| No streaming | User waits 5-10s with a spinner | Streaming partial recipes creates UI complexity (render incomplete cards?) for marginal UX gain on a 5-item response. | Stream recipe generation, render cards as they arrive. Detection stays non-streaming (small response). |
| No retry/circuit-breaker | Single failure = user taps retry manually | For a POC with one user, manual retry is fine. Automated retry risks double-billing on slow responses. | Exponential backoff with idempotency key. Circuit breaker if error rate >30% over 60s. |
| No offline support | App is useless without network | The core value requires an API call — there's no meaningful offline mode. | Cache last-shown recipes in AsyncStorage so the detail screen works offline after first load. |
| No image generation for recipes | Text-only recipe cards | Adds latency, cost, and a second AI vendor/model. Text cards are scannable and fast. | Add DALL-E/Stable Diffusion thumbnails as a background job, render placeholder until ready. |
| Client-side dedup only (normalized title matching) | Theoretically the model could return a semantically identical recipe with a different title | Title normalization catches 95% of repeats; semantic dedup requires embeddings infrastructure. | Embed recipe titles, cosine similarity > 0.85 = duplicate. Or maintain a recipe ID registry server-side. |
| No rate limiting on the proxy | Someone could hammer the endpoint and run up the Anthropic bill | POC has no public distribution. Adding rate limiting before you have users is premature defense. | Per-user rate limiting via Supabase Auth + RLS. Global rate limit at the edge function level. |
| Direct Anthropic dependency (no abstraction layer) | Switching to OpenAI/Gemini requires code changes | Single-vendor simplicity. Abstracting over multiple LLM providers before you know which features you need is speculative. | Introduce a provider interface when you have a concrete reason to multi-source (cost, capability, redundancy). |

## Meta-narrative

Every decision optimizes for *learning speed* (prove the loop works) while maintaining a clean upgrade path. Nothing is a dead end. The things we didn't build are explicitly deferred with a known path to add them — not forgotten or unaware.
