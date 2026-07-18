import type { ReactNode } from "react";
import { Pressable, Text, type AccessibilityRole } from "react-native";
import { colors, fonts, radii, spacing } from "@/src/theme";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  icon?: ReactNode;
  compact?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  icon,
  compact = false,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={compact ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined}
      style={({ pressed }) => ({
        alignSelf: compact ? "flex-start" : undefined,
        backgroundColor: colors.primaryMuted,
        borderRadius: radii.full,
        borderCurve: "continuous",
        paddingVertical: compact ? spacing.xs + 2 : 16,
        paddingHorizontal: compact ? spacing.md : spacing.xl,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: compact ? 4 : 8,
        borderWidth: 1.5,
        borderColor: "rgba(232, 106, 51, 0.35)",
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
      })}
    >
      {icon}
      <Text
        style={{
          fontFamily: fonts.body.semibold,
          fontSize: compact ? 12 : 15,
          color: colors.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
