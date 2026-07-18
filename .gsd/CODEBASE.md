# Codebase Map

Generated: 2026-07-18T16:19:24Z | Files: 34 | Described: 0/34
<!-- gsd:codebase-meta {"generatedAt":"2026-07-18T16:19:24Z","fingerprint":"e37865d8d6b2af5c868c2fa939e918cbe842c88d","fileCount":34,"truncated":false} -->

### (root)/
- `.gitignore`
- `app.json`
- `ARCHITECTURE.md`
- `LICENSE`
- `package-lock.json`
- `package.json`
- `README.md`
- `skills-lock.json`
- `tsconfig.json`

### app/
- `app/_layout.tsx`
- `app/index.tsx`
- `app/ingredients.tsx`
- `app/recipes.tsx`

### app/recipe/
- `app/recipe/[id].tsx`

### src/
- `src/theme.ts`

### src/components/
- `src/components/SkeletonCard.tsx`

### src/context/
- `src/context/RecipeSessionContext.tsx`

### src/data/
- `src/data/mockData.ts`

### src/services/
- `src/services/recipeApi.ts`

### src/types/
- `src/types/recipe.ts`

### supabase/
- `supabase/.gitignore`
- `supabase/config.toml`

### supabase/functions/_shared/
- `supabase/functions/_shared/cors.ts`

### supabase/functions/detect-ingredients/
- `supabase/functions/detect-ingredients/.npmrc`
- `supabase/functions/detect-ingredients/deno.json`
- `supabase/functions/detect-ingredients/handler.ts`
- `supabase/functions/detect-ingredients/index.ts`

### supabase/functions/generate-recipes/
- `supabase/functions/generate-recipes/.npmrc`
- `supabase/functions/generate-recipes/deno.json`
- `supabase/functions/generate-recipes/handler.ts`
- `supabase/functions/generate-recipes/index.ts`

### supabase/functions/tests/
- `supabase/functions/tests/detect-ingredients.test.ts`
- `supabase/functions/tests/generate-recipes.test.ts`
- `supabase/functions/tests/helpers.ts`
