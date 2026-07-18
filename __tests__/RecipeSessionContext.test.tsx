import React from "react";
import { Text, View, Pressable } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import {
  RecipeSessionProvider,
  useRecipeSession,
} from "@/src/context/RecipeSessionContext";
import { MOCK_RECIPES_SET_A } from "@/src/data/mockData";

function TestConsumer() {
  const ctx = useRecipeSession();

  return (
    <View>
      <Text testID="photo">{ctx.photoUri ?? "null"}</Text>
      <Text testID="ingredientCount">{ctx.ingredients.length}</Text>
      <Text testID="recipeCount">{ctx.recipes.length}</Text>
      <Text testID="shownCount">{ctx.shownRecipeTitles.length}</Text>
      <Text testID="isLoading">{String(ctx.isLoading)}</Text>
      <Text testID="noMore">{String(ctx.noMoreRecipes)}</Text>
      <Text testID="error">{ctx.error ?? "null"}</Text>

      <Pressable testID="setPhoto" onPress={() => ctx.setPhoto("file:///test.jpg")} />
      <Pressable
        testID="setIngredients"
        onPress={() => ctx.setIngredients([{ name: "egg" }, { name: "milk" }])}
      />
      <Pressable testID="removeIngredient" onPress={() => ctx.removeIngredient(0)} />
      <Pressable testID="setRecipes" onPress={() => ctx.setRecipes(MOCK_RECIPES_SET_A)} />
      <Pressable
        testID="addShownTitles"
        onPress={() => ctx.addShownTitles(["Recipe A", "Recipe B"])}
      />
      <Pressable testID="setLoading" onPress={() => ctx.setLoading(true)} />
      <Pressable testID="setNoMore" onPress={() => ctx.setNoMoreRecipes(true)} />
      <Pressable testID="setError" onPress={() => ctx.setError("boom")} />
      <Pressable testID="reset" onPress={() => ctx.resetSession()} />
    </View>
  );
}

function renderContext() {
  return render(
    <RecipeSessionProvider>
      <TestConsumer />
    </RecipeSessionProvider>,
  );
}

describe("RecipeSessionContext", () => {
  it("starts with empty session state", () => {
    renderContext();

    expect(screen.getByTestId("photo")).toHaveTextContent("null");
    expect(screen.getByTestId("ingredientCount")).toHaveTextContent("0");
    expect(screen.getByTestId("recipeCount")).toHaveTextContent("0");
    expect(screen.getByTestId("shownCount")).toHaveTextContent("0");
    expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    expect(screen.getByTestId("noMore")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });

  it("updates photo, ingredients, and recipes", () => {
    renderContext();

    fireEvent.press(screen.getByTestId("setPhoto"));
    fireEvent.press(screen.getByTestId("setIngredients"));
    fireEvent.press(screen.getByTestId("setRecipes"));

    expect(screen.getByTestId("photo")).toHaveTextContent("file:///test.jpg");
    expect(screen.getByTestId("ingredientCount")).toHaveTextContent("2");
    expect(screen.getByTestId("recipeCount")).toHaveTextContent("5");
  });

  it("removes an ingredient by index", () => {
    renderContext();
    fireEvent.press(screen.getByTestId("setIngredients"));
    fireEvent.press(screen.getByTestId("removeIngredient"));
    expect(screen.getByTestId("ingredientCount")).toHaveTextContent("1");
  });

  it("accumulates shown titles and flags", () => {
    renderContext();
    fireEvent.press(screen.getByTestId("addShownTitles"));
    fireEvent.press(screen.getByTestId("addShownTitles"));
    fireEvent.press(screen.getByTestId("setLoading"));
    fireEvent.press(screen.getByTestId("setNoMore"));
    fireEvent.press(screen.getByTestId("setError"));

    expect(screen.getByTestId("shownCount")).toHaveTextContent("4");
    expect(screen.getByTestId("isLoading")).toHaveTextContent("true");
    expect(screen.getByTestId("noMore")).toHaveTextContent("true");
    expect(screen.getByTestId("error")).toHaveTextContent("boom");
  });

  it("resetSession clears everything", () => {
    renderContext();

    fireEvent.press(screen.getByTestId("setPhoto"));
    fireEvent.press(screen.getByTestId("setIngredients"));
    fireEvent.press(screen.getByTestId("setRecipes"));
    fireEvent.press(screen.getByTestId("addShownTitles"));
    fireEvent.press(screen.getByTestId("setLoading"));
    fireEvent.press(screen.getByTestId("setNoMore"));
    fireEvent.press(screen.getByTestId("setError"));
    fireEvent.press(screen.getByTestId("reset"));

    expect(screen.getByTestId("photo")).toHaveTextContent("null");
    expect(screen.getByTestId("ingredientCount")).toHaveTextContent("0");
    expect(screen.getByTestId("recipeCount")).toHaveTextContent("0");
    expect(screen.getByTestId("shownCount")).toHaveTextContent("0");
    expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    expect(screen.getByTestId("noMore")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });
});

describe("useRecipeSession outside provider", () => {
  it("throws when used outside RecipeSessionProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useRecipeSession must be used within RecipeSessionProvider");

    spy.mockRestore();
  });
});
