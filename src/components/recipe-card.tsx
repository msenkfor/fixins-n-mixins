import React from "react";
import { View, Text, Pressable } from "react-native";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, radii, shadows, typography } from "@/src/theme";
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

interface RecipeCardProps {
  item: Recipe;
  onPress: (id: string) => void;
}

/** Memoized recipe card for FlatList. */
export const RecipeCard = React.memo(function RecipeCard({
  item,
  onPress,
}: RecipeCardProps) {
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
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
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
              fontFamily: fonts.body.semibold,
              fontSize: 12,
              color: colors.primary,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(item)}
          </Text>
        </View>
      </View>

      <Text
        selectable
        numberOfLines={2}
        style={{ ...typography.body, marginBottom: spacing.lg }}
      >
        {item.description}
      </Text>

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
              fontFamily: fonts.body.bold,
              fontSize: 13,
              color: colors.matchText,
              fontVariant: ["tabular-nums"],
            }}
          >
            {matchPercentage(item)}% match
          </Text>
          <Text
            style={{
              fontFamily: fonts.body.regular,
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
                  fontFamily: fonts.body.semibold,
                  fontSize: 11,
                  color: colors.tagText,
                }}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>

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
