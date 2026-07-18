import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SecondaryButton } from "@/src/components/secondary-button";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, radii, spacing, typography } from "@/src/theme";

interface IngredientsHeaderProps {
  photoUri: string | null;
  ingredientCount: number;
  onClose: () => void;
}

export function IngredientsHeader({
  photoUri,
  ingredientCount,
  onClose,
}: IngredientsHeaderProps) {
  const insets = useSafeAreaInsets();

  const subtitle =
    ingredientCount === 0
      ? "Try another photo to get started"
      : photoUri
        ? `${ingredientCount} detected — remove anything off`
        : "Remove anything that doesn't look right";

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.xs,
        paddingBottom: spacing.md,
        backgroundColor: colors.bgMuted,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -50,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primaryMuted,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -40,
          left: -30,
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: colors.accentMuted,
        }}
      />

      <View
        style={{
          paddingHorizontal: spacing.xl,
          gap: spacing.sm,
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
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radii.sm,
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: "rgba(45, 32, 22, 0.08)",
                }}
                contentFit="cover"
                accessibilityLabel="Photo used for ingredient detection"
              />
            ) : (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radii.sm,
                  borderCurve: "continuous",
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    ...typography.button,
                    fontSize: 18,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {ingredientCount}
                </Text>
              </View>
            )}

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...typography.h2, fontSize: 20 }}>Ingredients</Text>
              <Text
                style={{
                  ...typography.bodySmall,
                  fontFamily: fonts.body.medium,
                  color: colors.textSecondary,
                }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          <SecondaryButton
            label="Close"
            compact
            onPress={onClose}
            accessibilityLabel="Close ingredients"
            icon={
              <SFIcon
                name="xmark"
                size={11}
                tintColor={colors.primary as string}
                weight="bold"
              />
            }
          />
        </View>
      </View>
    </View>
  );
}
