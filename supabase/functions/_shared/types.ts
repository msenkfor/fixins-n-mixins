/** Ingredient detected from a photo — name required, quantity optional. */
export interface DetectedIngredient {
  name: string;
  quantity?: string;
}

/** Full ingredient in a recipe — includes unit and provenance. */
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

/** The subset of Recipe that Claude returns (no id or computed counts). */
export type RawRecipe = Omit<
  Recipe,
  "id" | "matchedIngredientCount" | "totalIngredientCount"
>;

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}

export interface AnthropicMessage {
  content: Array<
    | { type: "text"; text: string }
    | ToolUseBlock
    | { type: string }
  >;
}

export interface AnthropicClient {
  messages: {
    create(params: unknown): Promise<AnthropicMessage>;
  };
}

export interface HandlerDeps {
  getApiKey: () => string | undefined;
  createClient: (apiKey: string) => AnthropicClient;
}
