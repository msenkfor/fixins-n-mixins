import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SecondaryButton } from "@/src/components/secondary-button";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, radii, spacing, typography } from "@/src/theme";

interface RecipesHeaderProps {
  ingredientCount: number;
  recipeCount: number;
  isLoading: boolean;
  noMoreRecipes: boolean;
  onNewPhoto: () => void;
  onMoreRecipes: () => void;
}

export function RecipesHeader({
  ingredientCount,
  recipeCount,
  isLoading,
  noMoreRecipes,
  onNewPhoto,
  onMoreRecipes,
}: RecipesHeaderProps) {
  const insets = useSafeAreaInsets();
  const moreDisabled = noMoreRecipes || isLoading;

  const subtitle = isLoading
    ? "Finding the best matches…"
    : recipeCount > 0
      ? `${recipeCount} idea${recipeCount === 1 ? "" : "s"} from ${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"}`
      : `From ${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"} you snapped`;

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.sm,
        paddingBottom: spacing.lg,
        backgroundColor: colors.bgMuted,
        overflow: "hidden",
      }}
    >
      {/* Soft warm wash */}
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: colors.primaryMuted,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -50,
          left: -20,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.accentMuted,
        }}
      />

      <View
        style={{
          paddingHorizontal: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ ...typography.h1, fontSize: 28 }}>Recipes</Text>
            <Text
              style={{
                ...typography.bodySmall,
                fontFamily: fonts.body.medium,
                color: colors.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          </View>

          <Pressable
            onPress={onMoreRecipes}
            disabled={moreDisabled}
            accessibilityRole="button"
            accessibilityLabel="Get more recipe suggestions"
            accessibilityState={{ disabled: moreDisabled }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radii.full,
              borderCurve: "continuous",
              boxShadow: moreDisabled
                ? undefined
                : "0px 3px 10px rgba(232, 106, 51, 0.28)",
              opacity: moreDisabled ? 0.4 : pressed ? 0.88 : 1,
              transform: [{ scale: pressed && !moreDisabled ? 0.96 : 1 }],
            })}
          >
            <SFIcon
              name="arrow.clockwise"
              size={14}
              tintColor="#FFFFFF"
              weight="semibold"
            />
            <Text
              style={{
                fontFamily: fonts.body.bold,
                fontSize: 13,
                color: colors.textOnPrimary,
              }}
            >
              More
            </Text>
          </Pressable>
        </View>

        <SecondaryButton
          label="New photo"
          onPress={onNewPhoto}
          disabled={isLoading}
          compact
          accessibilityLabel="Take a new photo"
          icon={
            <SFIcon
              name="camera.fill"
              size={12}
              tintColor={colors.primary as string}
              weight="medium"
            />
          }
        />
      </View>
    </View>
  );
}
