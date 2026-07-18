import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { RecipeDetailHeader } from "@/src/components/recipe-detail-header";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, radii, typography } from "@/src/theme";

interface RecipeDetailScreenProps {
  recipeId: string;
}

export function RecipeDetailScreen({ recipeId }: RecipeDetailScreenProps) {
  const router = useRouter();
  const { recipes } = useRecipeSession();

  const recipe = recipes.find((r) => r.id === recipeId);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set()
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/recipes");
    }
  }, [router]);

  const toggleIngredient = useCallback((index: number) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const toggleStep = useCallback((order: number) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  }, []);

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View
          style={{
            paddingTop: 60,
            paddingHorizontal: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back to recipes"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: colors.primaryMuted,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
              borderRadius: radii.full,
              borderCurve: "continuous",
              borderWidth: 1.5,
              borderColor: "rgba(232, 106, 51, 0.35)",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <SFIcon
              name="chevron.left"
              size={12}
              tintColor={colors.primary as string}
              weight="semibold"
            />
            <Text
              style={{
                fontFamily: fonts.body.semibold,
                fontSize: 12,
                color: colors.primary,
              }}
            >
              Recipes
            </Text>
          </Pressable>
          <Text style={{ ...typography.h2 }}>Recipe not found</Text>
          <Text style={typography.body}>
            This recipe may have been from a previous session.
          </Text>
        </View>
      </View>
    );
  }

  const fromPhotoCount = recipe.ingredients.filter((i) => i.fromPhoto).length;
  const pantryCount = recipe.ingredients.length - fromPhotoCount;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <RecipeDetailHeader
          title={recipe.title}
          description={recipe.description}
          tags={recipe.tags}
          servings={recipe.servings}
          prepTimeMinutes={recipe.prepTimeMinutes}
          cookTimeMinutes={recipe.cookTimeMinutes}
          onBack={handleBack}
        />

        <View
          style={{
            paddingHorizontal: spacing.xl,
            marginTop: spacing.xxl,
            marginBottom: spacing.xxl,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ ...typography.h2, fontSize: 19 }}>Ingredients</Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              {fromPhotoCount} from photo
              {pantryCount > 0 ? ` · ${pantryCount} pantry` : ""}
            </Text>
          </View>

          <View style={{ gap: 2 }}>
            {recipe.ingredients.map((ing, i) => {
              const isChecked = checkedIngredients.has(i);
              return (
                <Pressable
                  key={`${ing.name}-${i}`}
                  onPress={() => toggleIngredient(i)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${ing.quantity} ${ing.unit} ${ing.name}${!ing.fromPhoto ? ", pantry item" : ""}`}
                  accessibilityState={{ checked: isChecked }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderRadius: radii.sm,
                    borderCurve: "continuous",
                    gap: spacing.md,
                    backgroundColor: isChecked
                      ? colors.bgOverlay
                      : "transparent",
                    opacity: pressed ? 0.7 : 1,
                    minHeight: 44,
                  })}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      borderCurve: "continuous",
                      borderWidth: 2,
                      borderColor: isChecked
                        ? (colors.accent as string)
                        : (colors.border as string),
                      backgroundColor: isChecked
                        ? (colors.accent as string)
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isChecked && (
                      <SFIcon
                        name="checkmark"
                        size={13}
                        tintColor="#FFFFFF"
                        weight="bold"
                      />
                    )}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: spacing.sm,
                      flex: 1,
                      alignItems: "baseline",
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        fontFamily: fonts.body.semibold,
                        fontSize: 14,
                        color: colors.primary,
                        minWidth: 56,
                        fontVariant: ["tabular-nums"],
                        ...(isChecked && {
                          textDecorationLine: "line-through" as const,
                          opacity: 0.4,
                        }),
                      }}
                    >
                      {ing.quantity} {ing.unit}
                    </Text>
                    <Text
                      selectable
                      style={{
                        fontFamily: fonts.body.regular,
                        fontSize: 15,
                        color: colors.text,
                        textTransform: "capitalize",
                        flex: 1,
                        ...(isChecked && {
                          textDecorationLine: "line-through" as const,
                          opacity: 0.4,
                        }),
                      }}
                    >
                      {ing.name}
                    </Text>
                  </View>

                  {!ing.fromPhoto && (
                    <View
                      style={{
                        backgroundColor: colors.pantryBg,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 3,
                        borderRadius: radii.sm,
                        borderCurve: "continuous",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.body.bold,
                          fontSize: 10,
                          color: colors.pantryText,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        pantry
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: spacing.xl,
            marginBottom: spacing.xxl,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ ...typography.h2, fontSize: 19 }}>Instructions</Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              {recipe.steps.length} steps
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            {recipe.steps.map((step) => {
              const isDone = completedSteps.has(step.order);
              return (
                <Pressable
                  key={step.order}
                  onPress={() => toggleStep(step.order)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Step ${step.order}: ${step.instruction}`}
                  accessibilityState={{ checked: isDone }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    gap: spacing.lg,
                    alignItems: "flex-start",
                    opacity: pressed ? 0.7 : 1,
                    minHeight: 44,
                  })}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderCurve: "continuous",
                      backgroundColor: isDone
                        ? (colors.accent as string)
                        : (colors.primary as string),
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    {isDone ? (
                      <SFIcon
                        name="checkmark"
                        size={15}
                        tintColor="#FFFFFF"
                        weight="bold"
                      />
                    ) : (
                      <Text
                        style={{
                          fontFamily: fonts.body.bold,
                          color: colors.textOnPrimary,
                          fontSize: 14,
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {step.order}
                      </Text>
                    )}
                  </View>
                  <Text
                    selectable
                    style={{
                      ...typography.body,
                      fontSize: 15,
                      lineHeight: 24,
                      color: colors.text,
                      flex: 1,
                      paddingTop: 4,
                      ...(isDone && {
                        textDecorationLine: "line-through" as const,
                        opacity: 0.4,
                      }),
                    }}
                  >
                    {step.instruction}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}
