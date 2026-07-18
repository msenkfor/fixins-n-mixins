import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useRecipeSession } from "../src/context/RecipeSessionContext";
import { refreshRecipes } from "../src/services/recipeApi";
import { RecipeListSkeleton } from "../src/components/SkeletonCard";
import { colors, spacing, radii, shadows, typography } from "../src/theme";
import { Recipe } from "../src/types/recipe";

export default function RecipeListScreen() {
  const router = useRouter();
  const {
    recipes,
    ingredients,
    isLoading,
    noMoreRecipes,
    shownRecipeTitles,
    setRecipes,
    addShownTitles,
    setLoading,
    setNoMoreRecipes,
    resetSession,
  } = useRecipeSession();

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const newRecipes = await refreshRecipes(ingredients, shownRecipeTitles);
      if (newRecipes.length === 0) {
        setNoMoreRecipes(true);
      } else {
        setRecipes(newRecipes);
        addShownTitles(newRecipes.map((r) => r.title));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    resetSession();
    router.replace("/");
  };

  const formatTime = (recipe: Recipe) => {
    const total = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    return `${total} min`;
  };

  const matchPercentage = (recipe: Recipe) => {
    return Math.round(
      (recipe.matchedIngredientCount / recipe.totalIngredientCount) * 100
    );
  };

  return (
    <View style={styles.container}>
      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleRetake}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionTextMuted}>New Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={noMoreRecipes || isLoading}
          style={[
            styles.refreshButton,
            (noMoreRecipes || isLoading) && styles.disabledButton,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshIcon}>✨</Text>
          <Text style={styles.refreshText}>More Recipes</Text>
        </TouchableOpacity>
      </View>

      {/* No-more banner */}
      {noMoreRecipes && (
        <View style={styles.noMoreBanner}>
          <Text style={styles.noMoreEmoji}>🍽️</Text>
          <Text style={styles.noMoreText}>
            You've seen all our suggestions — try a new photo for fresh ideas!
          </Text>
        </View>
      )}

      {/* Loading skeleton or recipe list */}
      {isLoading ? (
        <RecipeListSkeleton />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/recipe/${item.id}`)}
              activeOpacity={0.7}
            >
              {/* Card header */}
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeIcon}>⏱</Text>
                  <Text style={styles.timeText}>{formatTime(item)}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Footer with match + tags */}
              <View style={styles.cardFooter}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {matchPercentage(item)}% match
                  </Text>
                  <Text style={styles.matchDetail}>
                    {item.matchedIngredientCount}/{item.totalIngredientCount}{" "}
                    ingredients
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Subtle chevron */}
              <View style={styles.chevronWrap}>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionTextMuted: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.textMuted,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  refreshIcon: {
    fontSize: 14,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.35,
  },
  noMoreBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgMuted,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  noMoreEmoji: {
    fontSize: 24,
  },
  noMoreText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.card,
    position: "relative",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 18,
    flex: 1,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.bgMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  timeIcon: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  cardDescription: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchBadge: {
    backgroundColor: colors.matchBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  matchText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.matchText,
  },
  matchDetail: {
    fontSize: 10,
    color: colors.matchText,
    opacity: 0.7,
    marginTop: 1,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.tagText,
  },
  chevronWrap: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  chevron: {
    fontSize: 24,
    color: colors.border,
    fontWeight: "300",
  },
});
