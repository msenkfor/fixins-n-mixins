import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import RecipeListScreen from "@/app/recipes";
import { renderWithSession } from "./helpers/session";
import { MOCK_INGREDIENTS, MOCK_RECIPES_SET_A } from "@/src/data/mockData";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockRefreshRecipes = jest.fn();

jest.mock("expo-router", () => {
  const { Color } = require("./helpers/expo-router-mock");
  return {
    Color,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    }),
    useLocalSearchParams: () => ({}),
  };
});

jest.mock("@/src/services/recipeApi", () => ({
  refreshRecipes: (...args: unknown[]) => mockRefreshRecipes(...args),
}));

describe("RecipeListScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    mockRefreshRecipes.mockReset();
  });

  it("shows empty state with Try again and New photo", () => {
    renderWithSession(<RecipeListScreen />, {
      ingredients: MOCK_INGREDIENTS.slice(0, 2),
      recipes: [],
    });

    expect(screen.getByText("No recipes yet")).toBeTruthy();
    expect(screen.getByLabelText("Try again")).toBeTruthy();
    expect(screen.getByLabelText("New photo")).toBeTruthy();
  });

  it("lists recipes and opens detail on press", () => {
    renderWithSession(<RecipeListScreen />, {
      ingredients: MOCK_INGREDIENTS,
      recipes: MOCK_RECIPES_SET_A.slice(0, 2),
    });

    expect(screen.getByText("Chicken Stir-Fry")).toBeTruthy();
    expect(screen.getByText("Chicken Fajitas")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText(/Chicken Stir-Fry, 27 min, 75 percent match/),
    );
    expect(mockPush).toHaveBeenCalledWith("/recipe/mock-1");
  });

  it("shows the no-more banner when exhausted", () => {
    renderWithSession(<RecipeListScreen />, {
      ingredients: MOCK_INGREDIENTS,
      recipes: MOCK_RECIPES_SET_A.slice(0, 1),
      noMoreRecipes: true,
    });

    expect(
      screen.getByText(
        /You've seen all our suggestions — try a new photo for fresh ideas!/,
      ),
    ).toBeTruthy();
  });

  it("resets and returns home on New photo", () => {
    renderWithSession(<RecipeListScreen />, {
      recipes: [],
      ingredients: MOCK_INGREDIENTS.slice(0, 1),
    });

    fireEvent.press(screen.getByLabelText("New photo"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("calls refreshRecipes from empty-state Try again", async () => {
    mockRefreshRecipes.mockResolvedValueOnce(MOCK_RECIPES_SET_A.slice(0, 1));

    renderWithSession(<RecipeListScreen />, {
      recipes: [],
      ingredients: MOCK_INGREDIENTS.slice(0, 1),
    });

    fireEvent.press(screen.getByLabelText("Try again"));

    await waitFor(() => {
      expect(mockRefreshRecipes).toHaveBeenCalled();
    });
  });

  it("shows cooking loader while loading", () => {
    renderWithSession(<RecipeListScreen />, {
      isLoading: true,
      recipes: [],
      ingredients: MOCK_INGREDIENTS.slice(0, 1),
    });

    expect(screen.getByText("Cooking up recipes…")).toBeTruthy();
  });
});
