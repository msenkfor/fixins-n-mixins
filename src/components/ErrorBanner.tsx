import { View, Text, Pressable } from "react-native";
import { SFIcon } from "@/src/components/SFIcon";
import { colors, spacing, radii, typography } from "@/src/theme";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FEF2F2",
        marginHorizontal: spacing.xl,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.md,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "#FECACA",
        gap: spacing.md,
      }}
    >
      <SFIcon
        name="exclamationmark.triangle"
        size={20}
        tintColor={colors.danger as string}
        weight="medium"
        style={{ marginTop: 1 }}
      />
      <View style={{ flex: 1, gap: spacing.sm }}>
        <Text
          style={{
            ...typography.bodySmall,
            color: "#991B1B",
            fontWeight: "500",
          }}
        >
          {message}
        </Text>
        {(onRetry || onDismiss) && (
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {onRetry && (
              <Pressable
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Try again"
                hitSlop={8}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.danger as string,
                  }}
                >
                  Try Again
                </Text>
              </Pressable>
            )}
            {onDismiss && (
              <Pressable
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss error"
                hitSlop={8}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  Dismiss
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
