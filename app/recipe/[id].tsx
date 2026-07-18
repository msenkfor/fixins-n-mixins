import { useLocalSearchParams } from "expo-router";
import { RecipeDetailScreen } from "@/src/screens/recipe-detail-screen";

/** Route: /recipe/[id] — thin wrapper around RecipeDetailScreen. */
export default function RecipeDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecipeDetailScreen recipeId={id ?? ""} />;
}
