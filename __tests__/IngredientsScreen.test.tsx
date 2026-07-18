import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import IngredientsScreen from "@/app/ingredients";
import { renderWithSession } from "./helpers/session";
import { MOCK_INGREDIENTS } from "@/src/data/mockData";

const mockReplace = jest.fn();
const mockGenerateRecipes = jest.fn().mockResolvedValue([]);
const mockDetectIngredients = jest.fn().mockResolvedValue(MOCK_INGREDIENTS);

jest.mock("expo-router", () => {
  const { Color } = require("./helpers/expo-router-mock");
  return {
    Color,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    }),
    useLocalSearchParams: () => ({}),
  };
});

jest.mock("@/src/services/recipeApi", () => ({
  generateRecipes: (...args: unknown[]) => mockGenerateRecipes(...args),
  detectIngredients: (...args: unknown[]) => mockDetectIngredients(...args),
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file:///camera.jpg" }],
  }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file:///library.jpg" }],
  }),
}));

describe("IngredientsScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockGenerateRecipes.mockClear();
    mockDetectIngredients.mockClear();
  });

  it("shows empty state and expands Try again into photo options", () => {
    renderWithSession(<IngredientsScreen />);

    expect(screen.getByText("No ingredients found")).toBeTruthy();
    expect(screen.getByLabelText("Try again")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Try again"));

    expect(screen.getByLabelText("Take a Photo")).toBeTruthy();
    expect(screen.getByLabelText("Choose from Library")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("collapses retry options when Cancel is pressed", () => {
    renderWithSession(<IngredientsScreen />);

    fireEvent.press(screen.getByLabelText("Try again"));
    fireEvent.press(screen.getByText("Cancel"));

    expect(screen.getByLabelText("Try again")).toBeTruthy();
    expect(screen.queryByLabelText("Take a Photo")).toBeNull();
  });

  it("lists seeded ingredients and offers Find Recipes", () => {
    renderWithSession(<IngredientsScreen />, {
      ingredients: MOCK_INGREDIENTS.slice(0, 2),
      photoUri: "file:///fridge.jpg",
    });

    expect(screen.getByText("chicken breast")).toBeTruthy();
    expect(screen.getByText("bell pepper")).toBeTruthy();
    expect(screen.getByLabelText("Find Recipes")).toBeTruthy();
  });

  it("navigates to recipes and generates on Find Recipes", async () => {
    mockGenerateRecipes.mockResolvedValueOnce([]);

    renderWithSession(<IngredientsScreen />, {
      ingredients: MOCK_INGREDIENTS.slice(0, 1),
    });

    fireEvent.press(screen.getByLabelText("Find Recipes"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/recipes");
      expect(mockGenerateRecipes).toHaveBeenCalled();
    });
  });

  it("removes an ingredient from the list", async () => {
    renderWithSession(<IngredientsScreen />, {
      ingredients: [
        { name: "egg", quantity: "2" },
        { name: "milk" },
      ],
    });

    fireEvent.press(screen.getByLabelText("Remove egg"));

    await waitFor(() => {
      expect(screen.queryByText("egg")).toBeNull();
      expect(screen.getByText("milk")).toBeTruthy();
    });
  });

  it("shows scanning copy while loading an empty list", () => {
    renderWithSession(<IngredientsScreen />, {
      isLoading: true,
      ingredients: [],
    });

    expect(screen.getByText("Scanning your photo…")).toBeTruthy();
    expect(screen.queryByText("No ingredients found")).toBeNull();
  });
});
