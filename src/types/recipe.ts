export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  fromPhoto: boolean;
}

export interface RecipeStep {
  order: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tags: string[];
  matchedIngredientCount: number;
  totalIngredientCount: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

export interface DetectedIngredient {
  name: string;
  quantity?: string;
}
