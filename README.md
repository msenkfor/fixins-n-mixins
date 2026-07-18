# Fixins n Mixins

Snap a photo of your fridge or pantry — the app detects ingredients with Claude vision, lets you edit the list, then generates recipe ideas you can cook right away.

**Flow:** photo → detect ingredients → review/edit → generate recipes → open a recipe

## Stack

| Layer | Choice |
|---|---|
| App | Expo (React Native) + TypeScript + expo-router |
| Backend | Supabase Edge Functions (Deno) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) — vision + tool use |
| State | React Context (session-scoped, no persistence) |

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) (or an iOS Simulator / Android emulator)
- [Supabase CLI](https://supabase.com/docs/guides/cli) and Docker (for local backend)
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Create a `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
ANTHROPIC_API_KEY=sk-ant-...
```

For a **hosted** Supabase project, use that project’s URL and anon/publishable key instead of the local values. Set `ANTHROPIC_API_KEY` as a secret on the Edge Functions (not only in `.env`).

### 3. Start Supabase (local)

```bash
supabase start
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --env-file .env
supabase functions serve
```

Or deploy to a linked remote project:

```bash
supabase functions deploy detect-ingredients generate-recipes
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run the app

```bash
npx expo start
```

Then open in Expo Go, or press `i` / `a` for simulator/emulator.

## How it works

1. **Camera / library** — you take or pick a photo of ingredients.
2. **Detect** — the client compresses the image, base64-encodes it, and calls the `detect-ingredients` Edge Function. Claude vision returns a list of ingredient names (and quantities when visible).
3. **Review** — you can adjust the list before spending a generation call.
4. **Generate** — `generate-recipes` asks Claude (via forced tool use) for structured recipes from those ingredients.
5. **Browse** — recipe cards and a detail screen; refreshing asks for more recipes while excluding titles already shown.

The API key never ships in the client — only the Edge Functions talk to Anthropic.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start Expo |
| `npm run ios` | Expo → iOS |
| `npm run android` | Expo → Android |
| `npm run web` | Expo → web |
| `npm run test:functions` | Deno tests for Edge Functions |

## Project layout

```
app/                 Routes only (expo-router; dynamic segments like [id])
src/screens/         Screen UI with friendly names (e.g. recipe-detail-screen)
src/components/      Reusable UI (one component per file, kebab-case)
src/context/         Session state
src/services/        API client
src/theme.ts         Colors, fonts, spacing
supabase/functions/  detect-ingredients, generate-recipes, shared helpers
design-system/       Visual design tokens / notes
```

`app/` is navigation — keep route files thin. Put screen UI in `src/screens/` and shared pieces in `src/components/`.

## License

See [LICENSE](./LICENSE).
