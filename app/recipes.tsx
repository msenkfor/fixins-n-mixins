import { useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { refreshRecipes } from "@/src/services/recipeApi";
import { ErrorBanner } from "@/src/components/error-banner";
import { PrimaryButton } from "@/src/components/primary-button";
import { RecipeCard } from "@/src/components/recipe-card";
import { RecipeListSkeleton } from "@/src/components/recipe-list-skeleton";
import { RecipesHeader } from "@/src/components/recipes-header";
import { SecondaryButton } from "@/src/components/secondary-button";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, spacing, radii, typography } from "@/src/theme";
import { Recipe } from "@/src/types/recipe";

export default function RecipeListScreen() {
  const router = useRouter();
  const {
    recipes,
    ingredients,
    isLoading,
    noMoreRecipes,
    error,
    shownRecipeTitles,
    setRecipes,
    addShownTitles,
    setLoading,
    setNoMoreRecipes,
    setError,
    resetSession,
  } = useRecipeSession();

  const handleRefresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const newRecipes = await refreshRecipes(ingredients, shownRecipeTitles);
      if (newRecipes.length === 0) {
        setNoMoreRecipes(true);
      } else {
        setRecipes(newRecipes);
        addShownTitles(newRecipes.map((r) => r.title));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    resetSession();
    router.replace("/");
  };

  const handleRecipePress = useCallback(
    (id: string) => {
      router.push(`/recipe/${id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCard item={item} onPress={handleRecipePress} />
    ),
    [handleRecipePress]
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <RecipesHeader
        ingredientCount={ingredients.length}
        recipeCount={recipes.length}
        isLoading={isLoading}
        noMoreRecipes={noMoreRecipes}
        onNewPhoto={handleRetake}
        onMoreRecipes={handleRefresh}
      />

      {noMoreRecipes && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgMuted,
            marginHorizontal: spacing.xl,
            marginTop: spacing.md,
            padding: spacing.lg,
            borderRadius: radii.md,
            borderCurve: "continuous",
            gap: spacing.md,
          }}
        >
          <SFIcon
            name="fork.knife"
            size={22}
            tintColor={colors.primary as string}
            weight="medium"
          />
          <Text
            style={{
              ...typography.bodySmall,
              flex: 1,
              color: colors.textSecondary,
            }}
          >
            You've seen all our suggestions — try a new photo for fresh ideas!
          </Text>
        </View>
      )}

      {error && !isLoading && (
        <ErrorBanner
          message={error}
          onRetry={handleRefresh}
          onDismiss={() => setError(null)}
        />
      )}

      {isLoading ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignItems: "center",
              paddingTop: spacing.xxl,
              paddingBottom: spacing.md,
              gap: spacing.sm,
            }}
          >
            <LottieView
              source={require("@/assets/animations/cooking-loader.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={{ ...typography.h3, color: colors.text }}>
              Cooking up recipes…
            </Text>
            <Text style={typography.bodySmall}>
              Finding the best matches for your ingredients
            </Text>
          </View>
          <RecipeListSkeleton />
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            padding: spacing.lg,
            gap: spacing.md,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: spacing.xxl,
                paddingTop: 48,
                gap: spacing.md,
              }}
            >
              <SFIcon
                name="fork.knife"
                size={36}
                tintColor={colors.primary as string}
                weight="medium"
              />
              <Text style={{ ...typography.h3, textAlign: "center" }}>
                No recipes yet
              </Text>
              <Text
                style={{
                  ...typography.bodySmall,
                  textAlign: "center",
                  marginBottom: spacing.sm,
                }}
              >
                We couldn't find matches for these ingredients. Try again or
                snap a new photo.
              </Text>
              <View style={{ width: "100%", gap: spacing.sm }}>
                <PrimaryButton
                  label="Try again"
                  onPress={handleRefresh}
                  disabled={noMoreRecipes}
                  icon={
                    <SFIcon
                      name="arrow.clockwise"
                      size={16}
                      tintColor="#FFFFFF"
                      weight="semibold"
                    />
                  }
                />
                <SecondaryButton
                  label="New photo"
                  onPress={handleRetake}
                  icon={
                    <SFIcon
                      name="camera.fill"
                      size={16}
                      tintColor={colors.primary as string}
                      weight="medium"
                    />
                  }
                />
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
