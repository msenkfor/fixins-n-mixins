import React, { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { refreshRecipes } from "@/src/services/recipeApi";
import { RecipeListSkeleton } from "@/src/components/SkeletonCard";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";
import { Recipe } from "@/src/types/recipe";

const formatTime = (recipe: Recipe) => {
  const total = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  return `${total} min`;
};

const matchPercentage = (recipe: Recipe) => {
  return Math.round(
    (recipe.matchedIngredientCount / recipe.totalIngredientCount) * 100
  );
};

/** Memoized recipe card to avoid re-renders on FlatList scroll */
const RecipeCard = React.memo(function RecipeCard({
  item,
  onPress,
}: {
  item: Recipe;
  onPress: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${formatTime(item)}, ${matchPercentage(item)} percent match`}
      style={({ pressed }) => ({
        backgroundColor: colors.bgCard,
        borderRadius: radii.lg,
        borderCurve: "continuous",
        padding: spacing.xl,
        boxShadow: shadows.card,
        position: "relative" as const,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Card header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.sm,
          gap: spacing.md,
        }}
      >
        <Text
          selectable
          numberOfLines={2}
          style={{ ...typography.h3, fontSize: 18, flex: 1 }}
        >
          {item.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.bgMuted,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
            borderCurve: "continuous",
          }}
        >
          <SFIcon
            name="clock"
            size={12}
            tintColor={colors.primary as string}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primary,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(item)}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text
        selectable
        numberOfLines={2}
        style={{ ...typography.body, marginBottom: spacing.lg }}
      >
        {item.description}
      </Text>

      {/* Footer with match + tags */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.matchBg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs + 2,
            borderRadius: radii.sm,
            borderCurve: "continuous",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.matchText,
              fontVariant: ["tabular-nums"],
            }}
          >
            {matchPercentage(item)}% match
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.matchText,
              opacity: 0.7,
              marginTop: 1,
              fontVariant: ["tabular-nums"],
            }}
          >
            {item.matchedIngredientCount}/{item.totalIngredientCount}{" "}
            ingredients
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          {item.tags.slice(0, 2).map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: colors.tagBg,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radii.sm,
                borderCurve: "continuous",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.tagText,
                }}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Chevron */}
      <View
        style={{
          position: "absolute",
          right: spacing.md,
          top: 0,
          bottom: 0,
          justifyContent: "center",
        }}
      >
        <SFIcon
          name="chevron.right"
          size={16}
          tintColor={colors.border as string}
          weight="medium"
        />
      </View>
    </Pressable>
  );
});

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
      {/* Action bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <Pressable
          onPress={handleRetake}
          accessibilityRole="button"
          accessibilityLabel="Take a new photo"
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingVertical: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <SFIcon
            name="camera"
            size={16}
            tintColor={colors.textMuted as string}
          />
          <Text
            style={{
              ...typography.bodySmall,
              fontWeight: "600",
              color: colors.textMuted,
            }}
          >
            New Photo
          </Text>
        </Pressable>

        <Pressable
          onPress={handleRefresh}
          disabled={noMoreRecipes || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Get more recipe suggestions"
          accessibilityState={{ disabled: noMoreRecipes || isLoading }}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            backgroundColor: colors.primaryMuted,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radii.full,
            opacity:
              noMoreRecipes || isLoading ? 0.35 : pressed ? 0.7 : 1,
          })}
        >
          <SFIcon
            name="arrow.clockwise"
            size={14}
            tintColor={colors.primary as string}
            weight="semibold"
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.primary,
            }}
          >
            More Recipes
          </Text>
        </Pressable>
      </View>

      {/* No-more banner */}
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
          {/* Decorative emoji — not structural */}
          <Text style={{ fontSize: 24 }}>🍽️</Text>
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

      {/* Error banner */}
      {error && !isLoading && (
        <ErrorBanner
          message={error}
          onRetry={handleRefresh}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading animation + skeleton or recipe list */}
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
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
