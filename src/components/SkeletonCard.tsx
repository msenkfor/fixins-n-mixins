import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors, radii, shadows, spacing } from "../theme";

function ShimmerBlock({
  width,
  height,
  borderRadius = 6,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.skeletonBase,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton placeholder that mimics a recipe card layout.
 */
export function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <View style={[styles.card, { opacity: 1 - index * 0.15 }]}>
      {/* Title */}
      <ShimmerBlock width="65%" height={20} borderRadius={4} />
      {/* Description line 1 */}
      <ShimmerBlock
        width="90%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 12 }}
      />
      {/* Description line 2 */}
      <ShimmerBlock
        width="70%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />
      {/* Footer row */}
      <View style={styles.footerRow}>
        <ShimmerBlock width={100} height={14} borderRadius={4} />
        <View style={styles.tagRow}>
          <ShimmerBlock width={50} height={22} borderRadius={6} />
          <ShimmerBlock width={50} height={22} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

/**
 * Full skeleton loading state — shows 4 skeleton cards with a message.
 */
export function RecipeListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
