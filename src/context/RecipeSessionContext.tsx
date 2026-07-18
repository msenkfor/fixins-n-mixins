import React, { createContext, useState, useCallback } from "react";
import { DetectedIngredient, Recipe } from "../types/recipe";

interface RecipeSession {
  photoUri: string | null;
  ingredients: DetectedIngredient[];
  recipes: Recipe[];
  shownRecipeTitles: string[];
  isLoading: boolean;
  noMoreRecipes: boolean;
  error: string | null;

  setPhoto: (uri: string) => void;
  setIngredients: (ingredients: DetectedIngredient[]) => void;
  removeIngredient: (index: number) => void;
  setRecipes: (recipes: Recipe[]) => void;
  addShownTitles: (titles: string[]) => void;
  setLoading: (loading: boolean) => void;
  setNoMoreRecipes: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

const RecipeSessionContext = createContext<RecipeSession | null>(null);

export function RecipeSessionProvider({ children }: { children: React.ReactNode }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ingredients, setIngredientsState] = useState<DetectedIngredient[]>([]);
  const [recipes, setRecipesState] = useState<Recipe[]>([]);
  const [shownRecipeTitles, setShownRecipeTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noMoreRecipes, setNoMoreRecipesState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const setPhoto = useCallback((uri: string) => {
    setPhotoUri(uri);
  }, []);

  const setIngredients = useCallback((items: DetectedIngredient[]) => {
    setIngredientsState(items);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredientsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setRecipes = useCallback((newRecipes: Recipe[]) => {
    setRecipesState(newRecipes);
  }, []);

  const addShownTitles = useCallback((titles: string[]) => {
    setShownRecipeTitles((prev) => [...prev, ...titles]);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setNoMoreRecipes = useCallback((value: boolean) => {
    setNoMoreRecipesState(value);
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  const resetSession = useCallback(() => {
    setPhotoUri(null);
    setIngredientsState([]);
    setRecipesState([]);
    setShownRecipeTitles([]);
    setIsLoading(false);
    setNoMoreRecipesState(false);
    setErrorState(null);
  }, []);

  return (
    <RecipeSessionContext.Provider
      value={{
        photoUri,
        ingredients,
        recipes,
        shownRecipeTitles,
        isLoading,
        noMoreRecipes,
        error,
        setPhoto,
        setIngredients,
        removeIngredient,
        setRecipes,
        addShownTitles,
        setLoading,
        setNoMoreRecipes,
        setError,
        resetSession,
      }}
    >
      {children}
    </RecipeSessionContext.Provider>
  );
}

export function useRecipeSession(): RecipeSession {
  const ctx = React.use(RecipeSessionContext);
  if (!ctx) throw new Error("useRecipeSession must be used within RecipeSessionProvider");
  return ctx;
}
