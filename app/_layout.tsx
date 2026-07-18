import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { RecipeSessionProvider } from "@/src/context/RecipeSessionContext";
import { colors } from "@/src/theme";

export default function RootLayout() {
  return (
    <RecipeSessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg as string },
          headerTintColor: colors.text as string,
          headerTitleStyle: { fontWeight: "600", color: colors.text as string },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Fixins n Mixins", headerShown: false }}
        />
        <Stack.Screen
          name="ingredients"
          options={{
            title: "Your Ingredients",
            presentation: "modal",
            headerStyle: { backgroundColor: colors.bg as string },
          }}
        />
        <Stack.Screen name="recipes" options={{ title: "Recipes" }} />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: "",
            headerTransparent: true,
            headerBackTitle: "Recipes",
          }}
        />
      </Stack>
    </RecipeSessionProvider>
  );
}
