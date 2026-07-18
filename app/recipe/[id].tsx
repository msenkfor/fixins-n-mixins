import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import type { SFSymbol } from "expo-symbols";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes } = useRecipeSession();

  const recipe = recipes.find((r) => r.id === id);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set()
  );

  if (!recipe) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.xxl,
        }}
      >
        {/* Decorative emoji — not structural */}
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>🍽️</Text>
        <Text style={{ ...typography.h2, marginBottom: spacing.sm }}>
          Recipe not found
        </Text>
        <Text style={{ ...typography.body, textAlign: "center" }}>
          This recipe may have been from a previous session
        </Text>
      </View>
    );
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const toggleIngredient = useCallback(
    (index: number) => {
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
    },
    []
  );

  const toggleStep = useCallback(
    (order: number) => {
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
    },
    []
  );

  const fromPhotoCount = recipe.ingredients.filter((i) => i.fromPhoto).length;
  const pantryCount = recipe.ingredients.length - fromPhotoCount;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header */}
      <View
        style={{
          paddingHorizontal: spacing.xxl,
          paddingTop: 100,
          paddingBottom: spacing.xxl,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -60,
            left: -40,
            right: -40,
            height: 200,
            backgroundColor: colors.primaryMuted,
            borderBottomLeftRadius: 120,
            borderBottomRightRadius: 120,
            borderCurve: "continuous",
          }}
        />
        <Text
          selectable
          style={{ ...typography.h1, fontSize: 28, marginBottom: spacing.sm }}
        >
          {recipe.title}
        </Text>
        <Text
          selectable
          style={{
            ...typography.body,
            fontSize: 16,
            lineHeight: 24,
            marginBottom: spacing.lg,
          }}
        >
          {recipe.description}
        </Text>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            {recipe.tags.map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: colors.tagBg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 1,
                  borderRadius: radii.full,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.tagText,
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Time & servings card */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.bgCard,
          marginHorizontal: spacing.xl,
          borderRadius: radii.lg,
          borderCurve: "continuous",
          padding: spacing.lg,
          justifyContent: "space-around",
          alignItems: "center",
          boxShadow: shadows.card,
          marginBottom: spacing.xxl,
        }}
      >
        <MetaItem icon="person" label="Servings" value={String(recipe.servings)} />
        <View
          style={{ width: 1, height: 32, backgroundColor: colors.borderLight }}
        />
        <MetaItem
          icon="clock"
          label="Prep"
          value={`${recipe.prepTimeMinutes}m`}
        />
        <View
          style={{ width: 1, height: 32, backgroundColor: colors.borderLight }}
        />
        <MetaItem
          icon="flame"
          label="Cook"
          value={`${recipe.cookTimeMinutes}m`}
        />
        <View
          style={{ width: 1, height: 32, backgroundColor: colors.borderLight }}
        />
        <MetaItem icon="clock.fill" label="Total" value={`${totalTime}m`} />
      </View>

      {/* Ingredients section */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }}>
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
                  backgroundColor: isChecked ? colors.bgOverlay : "transparent",
                  opacity: pressed ? 0.7 : 1,
                  minHeight: 44,
                })}
              >
                {/* Checkbox */}
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
                    backgroundColor: isChecked ? (colors.accent as string) : "transparent",
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

                {/* Ingredient info */}
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
                      fontSize: 14,
                      fontWeight: "600",
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

                {/* Badge */}
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
                        fontSize: 10,
                        fontWeight: "700",
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

      {/* Steps section */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }}>
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
                        color: colors.textOnPrimary,
                        fontSize: 14,
                        fontWeight: "700",
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

      {/* Bottom spacer for safe area */}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: SFSymbol;
  label: string;
  value: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <SFIcon
        name={icon}
        size={18}
        tintColor={colors.primary as string}
        style={{ marginBottom: 2 }}
      />
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: colors.primary,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
