import type { SFSymbol } from "expo-symbols";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, radii, shadows, spacing, typography } from "@/src/theme";

interface RecipeDetailHeaderProps {
  title: string;
  description: string;
  tags: string[];
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  onBack: () => void;
}

export function RecipeDetailHeader({
  title,
  description,
  tags,
  servings,
  prepTimeMinutes,
  cookTimeMinutes,
  onBack,
}: RecipeDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.sm,
        paddingBottom: spacing.xl,
        backgroundColor: colors.bgMuted,
        overflow: "hidden",
      }}
    >
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
        <Pressable
          onPress={onBack}
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
            transform: [{ scale: pressed ? 0.96 : 1 }],
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

        <View style={{ gap: spacing.sm }}>
          <Text
            selectable
            style={{ ...typography.h1, fontSize: 28, lineHeight: 34 }}
          >
            {title}
          </Text>
          <Text
            selectable
            style={{
              ...typography.body,
              fontSize: 15,
              lineHeight: 22,
              color: colors.textSecondary,
            }}
          >
            {description}
          </Text>
        </View>

        {tags.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            {tags.map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: colors.bgCard,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 1,
                  borderRadius: radii.full,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body.semibold,
                    fontSize: 12,
                    color: colors.tagText,
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: spacing.md,
          }}
        >
          <MetaChip icon="person.fill" label={`${servings} servings`} />
          <MetaChip icon="clock.fill" label={`${totalTime} min`} />
          <MetaChip icon="flame.fill" label={`${cookTimeMinutes}m cook`} />
        </View>
      </View>
    </View>
  );
}

function MetaChip({ icon, label }: { icon: SFSymbol; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.bgCard,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.full,
        borderCurve: "continuous",
        boxShadow: shadows.soft,
      }}
    >
      <SFIcon
        name={icon}
        size={13}
        tintColor={colors.primary as string}
        weight="semibold"
      />
      <Text
        style={{
          fontFamily: fonts.body.semibold,
          fontSize: 12,
          color: colors.text,
          fontVariant: ["tabular-nums"],
        }}
      >
        {label}
      </Text>
    </View>
  );
}
