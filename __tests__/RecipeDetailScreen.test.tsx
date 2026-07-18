import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { RecipeDetailScreen } from "@/src/screens/recipe-detail-screen";
import { renderWithSession } from "./helpers/session";
import { MOCK_RECIPES_SET_A } from "@/src/data/mockData";

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  const { Color } = require("./helpers/expo-router-mock");
  return {
    Color,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: mockBack,
      canGoBack: jest.fn(() => true),
    }),
    useLocalSearchParams: () => ({}),
  };
});

describe("RecipeDetailScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("renders recipe content from session", () => {
    const recipe = MOCK_RECIPES_SET_A[0];
    renderWithSession(<RecipeDetailScreen recipeId={recipe.id} />, {
      recipes: [recipe],
    });

    expect(screen.getByText(recipe.title)).toBeTruthy();
    expect(screen.getByText(recipe.description)).toBeTruthy();
    expect(screen.getByText("Ingredients")).toBeTruthy();
    expect(screen.getByText("Instructions")).toBeTruthy();
    expect(screen.getByText(/from photo/)).toBeTruthy();
    expect(screen.getAllByText("pantry").length).toBeGreaterThan(0);
  });

  it("toggles ingredient and step checkboxes", () => {
    const recipe = MOCK_RECIPES_SET_A[0];
    renderWithSession(<RecipeDetailScreen recipeId={recipe.id} />, {
      recipes: [recipe],
    });

    const ingredient = screen.getByLabelText(/2 lbs chicken breast/);
    const step = screen.getByLabelText(/Step 1:/);

    expect(ingredient.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
    fireEvent.press(ingredient);
    expect(ingredient.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );

    fireEvent.press(step);
    expect(step.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it("shows not-found state for missing recipes", () => {
    renderWithSession(<RecipeDetailScreen recipeId="missing" />, {
      recipes: MOCK_RECIPES_SET_A.slice(0, 1),
    });

    expect(screen.getByText("Recipe not found")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Back to recipes"));
    expect(mockBack).toHaveBeenCalled();
  });
});
