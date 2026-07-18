import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { RecipeSessionProvider } from "@/src/context/RecipeSessionContext";
import { colors, fonts } from "@/src/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <RecipeSessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg as string },
          headerTintColor: colors.text as string,
          headerTitleStyle: {
            fontFamily: fonts.heading.semibold,
            color: colors.text as string,
          },
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
            title: "Ingredients",
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recipes"
          options={{ title: "Recipes", headerShown: false }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </RecipeSessionProvider>
  );
}
