import { View } from "react-native";
import { SkeletonCard } from "@/src/components/skeleton-card";
import { spacing } from "@/src/theme";

/** Full skeleton loading state — shows 4 skeleton cards. */
export function RecipeListSkeleton() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );
}
