import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "@/src/components/primary-button";
import { SecondaryButton } from "@/src/components/secondary-button";
import { ErrorBanner } from "@/src/components/error-banner";
import { IngredientCard } from "@/src/components/ingredient-card";
import { RecipeCard } from "@/src/components/recipe-card";
import { MOCK_RECIPES_SET_A } from "@/src/data/mockData";

describe("PrimaryButton", () => {
  it("calls onPress and uses the label as accessibility label", () => {
    const onPress = jest.fn();
    render(<PrimaryButton label="Find Recipes" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText("Find Recipes"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", () => {
    const onPress = jest.fn();
    render(<PrimaryButton label="Find Recipes" onPress={onPress} disabled />);

    fireEvent.press(screen.getByLabelText("Find Recipes"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders an optional icon", () => {
    render(
      <PrimaryButton
        label="Go"
        onPress={jest.fn()}
        icon={<Text testID="icon">→</Text>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeTruthy();
  });
});

describe("SecondaryButton", () => {
  it("calls onPress", () => {
    const onPress = jest.fn();
    render(<SecondaryButton label="New photo" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("New photo"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe("ErrorBanner", () => {
  it("shows the message and wires retry/dismiss", () => {
    const onRetry = jest.fn();
    const onDismiss = jest.fn();
    render(
      <ErrorBanner
        message="Something went wrong"
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Try again"));
    fireEvent.press(screen.getByLabelText("Dismiss error"));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("IngredientCard", () => {
  it("shows name/quantity and removes on press", () => {
    const onRemove = jest.fn();
    render(
      <IngredientCard
        item={{ name: "garlic", quantity: "1 head" }}
        index={2}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("garlic")).toBeTruthy();
    expect(screen.getByText("1 head")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Remove garlic"));
    expect(onRemove).toHaveBeenCalledWith(2);
  });
});

describe("RecipeCard", () => {
  it("shows title, match %, and navigates on press", () => {
    const onPress = jest.fn();
    const recipe = MOCK_RECIPES_SET_A[0];
    render(<RecipeCard item={recipe} onPress={onPress} />);

    expect(screen.getByText(recipe.title)).toBeTruthy();
    expect(screen.getByText("75% match")).toBeTruthy();
    expect(screen.getByText("6/8 ingredients")).toBeTruthy();
    fireEvent.press(
      screen.getByLabelText(/Chicken Stir-Fry, 27 min, 75 percent match/),
    );
    expect(onPress).toHaveBeenCalledWith(recipe.id);
  });
});
