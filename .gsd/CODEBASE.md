# Codebase Map

Generated: 2026-07-18T19:40:50Z | Files: 44 | Described: 0/44
<!-- gsd:codebase-meta {"generatedAt":"2026-07-18T19:40:50Z","fingerprint":"6e52db855fcf73f2b814cf1548e68786710c0360","fileCount":44,"truncated":false} -->

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

### assets/animations/
- `assets/animations/cooking-loader.json`
- `assets/animations/scanning.json`
- `assets/animations/splash-hero.json`

### design-system/fixins-n-mixins/
- `design-system/fixins-n-mixins/MASTER.md`

### src/
- `src/theme.ts`

### src/components/
- `src/components/ErrorBanner.tsx`
- `src/components/SFIcon.tsx`
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
- `supabase/functions/_shared/config.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/response.ts`
- `supabase/functions/_shared/types.ts`

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
- `supabase/functions/generate-recipes/tool-schema.ts`

### supabase/functions/tests/
- `supabase/functions/tests/detect-ingredients.test.ts`
- `supabase/functions/tests/generate-recipes.test.ts`
- `supabase/functions/tests/helpers.ts`
