import type { ReactNode } from "react";
import { Pressable, Text, type AccessibilityRole } from "react-native";
import { colors, radii, shadows, spacing, typography } from "@/src/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  icon,
  iconPosition = "left",
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        backgroundColor: colors.primary,
        borderRadius: radii.full,
        borderCurve: "continuous",
        paddingVertical: 18,
        paddingHorizontal: spacing.xl,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.sm,
        boxShadow: disabled ? undefined : shadows.cta,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
      })}
    >
      {icon && iconPosition === "left" ? icon : null}
      <Text style={typography.button}>{label}</Text>
      {icon && iconPosition === "right" ? icon : null}
    </Pressable>
  );
}
