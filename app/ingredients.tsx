import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRecipeSession } from "../src/context/RecipeSessionContext";
import { generateRecipes } from "../src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "../src/theme";

export default function IngredientsScreen() {
  const router = useRouter();
  const {
    ingredients,
    removeIngredient,
    setRecipes,
    addShownTitles,
    setLoading,
    shownRecipeTitles,
  } = useRecipeSession();

  const handleConfirm = async () => {
    setLoading(true);
    router.replace("/recipes");

    try {
      const recipes = await generateRecipes(ingredients, shownRecipeTitles);
      setRecipes(recipes);
      addShownTitles(recipes.map((r) => r.title));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.headerSection}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{ingredients.length}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Ingredients Found</Text>
          <Text style={styles.subheading}>
            Remove anything that doesn't look right
          </Text>
        </View>
      </View>

      {/* Ingredient list */}
      <FlatList
        data={ingredients}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.ingredientCard}>
            <View style={styles.ingredientInfo}>
              <View style={styles.dot} />
              <View style={styles.ingredientTextWrap}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                {item.quantity && (
                  <Text style={styles.ingredientQty}>{item.quantity}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeIngredient(index)}
              style={styles.removeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧺</Text>
            <Text style={styles.emptyText}>No ingredients remaining</Text>
            <Text style={styles.emptySubtext}>
              Go back and take another photo
            </Text>
          </View>
        }
      />

      {/* Confirm button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            ingredients.length === 0 && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={ingredients.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmText}>Find Recipes</Text>
          <Text style={styles.confirmArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  countBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textOnPrimary,
  },
  headerText: {
    flex: 1,
  },
  heading: {
    ...typography.h2,
    marginBottom: 2,
  },
  subheading: {
    ...typography.bodySmall,
  },
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ingredientCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadows.soft,
  },
  ingredientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  ingredientTextWrap: {
    flex: 1,
  },
  ingredientName: {
    ...typography.label,
    textTransform: "capitalize",
  },
  ingredientQty: {
    ...typography.caption,
    marginTop: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dangerMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  emptySubtext: {
    ...typography.bodySmall,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 36,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.card,
  },
  disabledButton: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  confirmArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
});
