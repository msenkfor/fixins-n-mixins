import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, radii, shadows, spacing } from "@/src/theme";

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
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          borderCurve: "continuous",
          backgroundColor: colors.skeletonBase,
        },
        animatedStyle,
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
    <View
      style={{
        backgroundColor: colors.bgCard as string,
        borderRadius: radii.lg,
        borderCurve: "continuous",
        padding: spacing.xl,
        boxShadow: shadows.card,
        opacity: 1 - index * 0.15,
      }}
    >
      <ShimmerBlock width="65%" height={20} borderRadius={4} />
      <ShimmerBlock
        width="90%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 12 }}
      />
      <ShimmerBlock
        width="70%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <ShimmerBlock width={100} height={14} borderRadius={4} />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <ShimmerBlock width={50} height={22} borderRadius={6} />
          <ShimmerBlock width={50} height={22} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

/**
 * Full skeleton loading state — shows 4 skeleton cards.
 */
export function RecipeListSkeleton() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );
}
