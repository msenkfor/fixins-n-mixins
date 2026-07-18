import { View, Text, Pressable } from "react-native";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, radii, typography } from "@/src/theme";

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
        backgroundColor: colors.dangerMuted,
        marginHorizontal: spacing.xl,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.md,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "rgba(212, 83, 75, 0.25)",
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
            fontFamily: fonts.body.medium,
            color: colors.danger,
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
                    fontFamily: fonts.body.bold,
                    fontSize: 13,
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
                    fontFamily: fonts.body.semibold,
                    fontSize: 13,
                    color: colors.textMuted,
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
