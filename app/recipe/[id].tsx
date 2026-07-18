import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRecipeSession } from "../../src/context/RecipeSessionContext";
import { colors, spacing, radii, shadows, typography } from "../../src/theme";

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
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🍽️</Text>
        <Text style={styles.errorText}>Recipe not found</Text>
        <Text style={styles.errorSubtext}>
          This recipe may have been from a previous session
        </Text>
      </View>
    );
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleStep = (order: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  const fromPhotoCount = recipe.ingredients.filter((i) => i.fromPhoto).length;
  const pantryCount = recipe.ingredients.length - fromPhotoCount;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroDecoration} />
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Time & servings card */}
      <View style={styles.metaCard}>
        <MetaItem emoji="👤" label="Servings" value={String(recipe.servings)} />
        <View style={styles.metaDivider} />
        <MetaItem emoji="🔪" label="Prep" value={`${recipe.prepTimeMinutes}m`} />
        <View style={styles.metaDivider} />
        <MetaItem emoji="🔥" label="Cook" value={`${recipe.cookTimeMinutes}m`} />
        <View style={styles.metaDivider} />
        <MetaItem emoji="⏱" label="Total" value={`${totalTime}m`} />
      </View>

      {/* Ingredients section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.sectionMeta}>
            {fromPhotoCount} from photo{pantryCount > 0 ? ` · ${pantryCount} pantry` : ""}
          </Text>
        </View>

        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ing, i) => {
            const isChecked = checkedIngredients.has(i);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.ingredientRow,
                  isChecked && styles.ingredientChecked,
                ]}
                onPress={() => toggleIngredient(i)}
                activeOpacity={0.7}
              >
                {/* Checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                  ]}
                >
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>

                {/* Ingredient info */}
                <View style={styles.ingredientInfo}>
                  <Text
                    style={[
                      styles.ingredientQty,
                      isChecked && styles.textStrikethrough,
                    ]}
                  >
                    {ing.quantity} {ing.unit}
                  </Text>
                  <Text
                    style={[
                      styles.ingredientName,
                      isChecked && styles.textStrikethrough,
                    ]}
                  >
                    {ing.name}
                  </Text>
                </View>

                {/* Badge */}
                {!ing.fromPhoto && (
                  <View style={styles.pantryBadge}>
                    <Text style={styles.pantryText}>pantry</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Steps section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.sectionMeta}>
            {recipe.steps.length} steps
          </Text>
        </View>

        <View style={styles.stepsList}>
          {recipe.steps.map((step) => {
            const isDone = completedSteps.has(step.order);
            return (
              <TouchableOpacity
                key={step.order}
                style={styles.stepRow}
                onPress={() => toggleStep(step.order)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.stepNumber,
                    isDone && styles.stepNumberDone,
                  ]}
                >
                  {isDone ? (
                    <Text style={styles.stepCheckmark}>✓</Text>
                  ) : (
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    isDone && styles.stepTextDone,
                  ]}
                >
                  {step.instruction}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom spacer for safe area */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function MetaItem({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaEmoji}>{emoji}</Text>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 20,
  },

  // Hero
  heroHeader: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 100, // space for transparent nav header
    paddingBottom: spacing.xxl,
    position: "relative",
    overflow: "hidden",
  },
  heroDecoration: {
    position: "absolute",
    top: -60,
    left: -40,
    right: -40,
    height: 200,
    backgroundColor: colors.primaryMuted,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.full,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.tagText,
  },

  // Meta card
  metaCard: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    padding: spacing.lg,
    justifyContent: "space-around",
    alignItems: "center",
    ...shadows.card,
    marginBottom: spacing.xxl,
  },
  metaItem: {
    alignItems: "center",
    gap: 2,
  },
  metaEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
  },
  metaDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 19,
  },
  sectionMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Ingredients
  ingredientsList: {
    gap: 2,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    gap: spacing.md,
  },
  ingredientChecked: {
    backgroundColor: colors.bgOverlay,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  ingredientInfo: {
    flexDirection: "row",
    gap: spacing.sm,
    flex: 1,
    alignItems: "baseline",
  },
  ingredientQty: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    minWidth: 56,
  },
  ingredientName: {
    fontSize: 15,
    color: colors.text,
    textTransform: "capitalize",
    flex: 1,
  },
  textStrikethrough: {
    textDecorationLine: "line-through",
    opacity: 0.4,
  },
  pantryBadge: {
    backgroundColor: colors.pantryBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  pantryText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.pantryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Steps
  stepsList: {
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepNumberDone: {
    backgroundColor: colors.accent,
  },
  stepNumberText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  stepCheckmark: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  stepText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    flex: 1,
    paddingTop: 4,
  },
  stepTextDone: {
    textDecorationLine: "line-through",
    opacity: 0.4,
  },

  // Bottom
  bottomSpacer: {
    height: 48,
  },

  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    ...typography.body,
    textAlign: "center",
  },
});
