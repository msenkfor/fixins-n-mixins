import { View } from "react-native";
import { ShimmerBlock } from "@/src/components/shimmer-block";
import { colors, radii, shadows, spacing } from "@/src/theme";

interface SkeletonCardProps {
  index?: number;
}

/** Skeleton placeholder that mimics a recipe card layout. */
export function SkeletonCard({ index = 0 }: SkeletonCardProps) {
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
