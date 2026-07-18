# Codebase Map

Generated: 2026-07-18T16:13:26Z | Files: 38 | Described: 0/38
<!-- gsd:codebase-meta {"generatedAt":"2026-07-18T16:13:26Z","fingerprint":"385349efd9716d34155576c8c97929992d561b17","fileCount":38,"truncated":false} -->

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
