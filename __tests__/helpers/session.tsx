import React, { useLayoutEffect, useState } from "react";
import { render, waitFor } from "@testing-library/react-native";
import {
  RecipeSessionProvider,
  useRecipeSession,
} from "@/src/context/RecipeSessionContext";
import type { DetectedIngredient, Recipe } from "@/src/types/recipe";

export type SessionSeed = {
  photoUri?: string | null;
  ingredients?: DetectedIngredient[];
  recipes?: Recipe[];
  shownRecipeTitles?: string[];
  isLoading?: boolean;
  noMoreRecipes?: boolean;
  error?: string | null;
};

function SessionSeeder({
  seed,
  children,
}: {
  seed: SessionSeed;
  children: React.ReactNode;
}) {
  const session = useRecipeSession();
  const [ready, setReady] = useState(Object.keys(seed).length === 0);

  useLayoutEffect(() => {
    if (seed.photoUri != null) session.setPhoto(seed.photoUri);
    if (seed.ingredients) session.setIngredients(seed.ingredients);
    if (seed.recipes) session.setRecipes(seed.recipes);
    if (seed.shownRecipeTitles) session.addShownTitles(seed.shownRecipeTitles);
    if (seed.isLoading != null) session.setLoading(seed.isLoading);
    if (seed.noMoreRecipes != null) session.setNoMoreRecipes(seed.noMoreRecipes);
    if (seed.error !== undefined) session.setError(seed.error);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once on mount
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

/** Render a screen inside RecipeSessionProvider with optional seeded state. */
export function renderWithSession(
  ui: React.ReactElement,
  seed: SessionSeed = {},
) {
  const result = render(
    <RecipeSessionProvider>
      <SessionSeeder seed={seed}>{ui}</SessionSeeder>
    </RecipeSessionProvider>,
  );
  return result;
}

export { waitFor };
