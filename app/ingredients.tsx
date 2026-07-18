import React, { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { generateRecipes } from "@/src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";
import { DetectedIngredient } from "@/src/types/recipe";

/** Memoized ingredient card to avoid re-renders on FlatList scroll */
const IngredientCard = React.memo(function IngredientCard({
  item,
  index,
  onRemove,
}: {
  item: DetectedIngredient;
  index: number;
  onRemove: (index: number) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: radii.md,
        borderCurve: "continuous",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: shadows.soft,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          gap: spacing.md,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.accent,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            selectable
            style={{ ...typography.label, textTransform: "capitalize" }}
          >
            {item.name}
          </Text>
          {item.quantity && (
            <Text selectable style={{ ...typography.caption, marginTop: 1 }}>
              {item.quantity}
            </Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={() => onRemove(index)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name}`}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: 22,
          borderCurve: "continuous",
          backgroundColor: pressed ? colors.dangerMuted : "transparent",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: colors.dangerMuted,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SFIcon
            name="xmark"
            size={12}
            tintColor={colors.danger as string}
            weight="bold"
          />
        </View>
      </Pressable>
    </View>
  );
});

export default function IngredientsScreen() {
  const router = useRouter();
  const {
    ingredients,
    removeIngredient,
    setRecipes,
    addShownTitles,
    setLoading,
    setError,
    shownRecipeTitles,
  } = useRecipeSession();

  const handleConfirm = async () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setError(null);
    setLoading(true);
    // Navigate immediately — the recipes screen shows a skeleton loader
    router.replace("/recipes");

    try {
      const recipes = await generateRecipes(ingredients, shownRecipeTitles);
      setRecipes(recipes);
      addShownTitles(recipes.map((r) => r.title));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = useCallback(
    (index: number) => {
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      removeIngredient(index);
    },
    [removeIngredient]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: DetectedIngredient; index: number }) => (
      <IngredientCard item={item} index={index} onRemove={handleRemove} />
    ),
    [handleRemove]
  );

  // Use ingredient name + index as key since ingredients lack stable IDs
  const keyExtractor = useCallback(
    (item: DetectedIngredient, i: number) => `${item.name}-${i}`,
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderCurve: "continuous",
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.textOnPrimary,
              fontVariant: ["tabular-nums"],
            }}
          >
            {ingredients.length}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.h2, marginBottom: 2 }}>
            Ingredients Found
          </Text>
          <Text style={typography.bodySmall}>
            Remove anything that doesn't look right
          </Text>
        </View>
      </View>

      {/* Ingredient list */}
      <FlatList
        data={ingredients}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.sm,
          paddingBottom: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: spacing.sm }}>
            {/* Decorative emoji — not structural */}
            <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>🧺</Text>
            <Text style={{ ...typography.h3, color: colors.textSecondary }}>
              No ingredients remaining
            </Text>
            <Text style={typography.bodySmall}>
              Go back and take another photo
            </Text>
          </View>
        }
      />

      {/* Confirm button */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: 36,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}
      >
        <Pressable
          onPress={handleConfirm}
          disabled={ingredients.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Find recipes with these ingredients"
          accessibilityState={{ disabled: ingredients.length === 0 }}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: radii.lg,
            borderCurve: "continuous",
            paddingVertical: 18,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: spacing.sm,
            boxShadow: shadows.card,
            opacity: ingredients.length === 0 ? 0.4 : pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.textOnPrimary,
            }}
          >
            Find Recipes
          </Text>
          <SFIcon
            name="arrow.right"
            size={18}
            tintColor="#FFFFFF"
            weight="bold"
          />
        </Pressable>
      </View>
    </View>
  );
}
