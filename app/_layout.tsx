import { Stack } from "expo-router";
import { RecipeSessionProvider } from "../src/context/RecipeSessionContext";

export default function RootLayout() {
  return (
    <RecipeSessionProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#16213e" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Fixins n Mixins", headerShown: false }} />
        <Stack.Screen name="ingredients" options={{ title: "Your Ingredients", presentation: "modal" }} />
        <Stack.Screen name="recipes" options={{ title: "Recipes" }} />
        <Stack.Screen name="recipe/[id]" options={{ title: "Recipe" }} />
      </Stack>
    </RecipeSessionProvider>
  );
}
