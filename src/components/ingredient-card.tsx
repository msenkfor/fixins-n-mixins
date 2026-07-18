import React from "react";
import { View, Text, Pressable } from "react-native";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { DetectedIngredient } from "@/src/types/recipe";

interface IngredientCardProps {
  item: DetectedIngredient;
  index: number;
  onRemove: (index: number) => void;
}

/** Memoized ingredient row for FlatList. */
export const IngredientCard = React.memo(function IngredientCard({
  item,
  index,
  onRemove,
}: IngredientCardProps) {
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
