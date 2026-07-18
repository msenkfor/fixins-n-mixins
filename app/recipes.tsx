import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useRecipeSession } from "../src/context/RecipeSessionContext";

export default function RecipeListScreen() {
  const router = useRouter();
  const { recipes, isLoading, noMoreRecipes, resetSession } = useRecipeSession();

  const handleRefresh = () => {
    // TODO: Wire to real recipe generation with dedup logic
  };

  const handleRetake = () => {
    resetSession();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleRetake}>
          <Text style={styles.retakeText}>📷 New Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRefresh} disabled={noMoreRecipes || isLoading}>
          <Text style={[styles.refreshText, (noMoreRecipes || isLoading) && styles.disabledText]}>
            🔄 More Recipes
          </Text>
        </TouchableOpacity>
      </View>

      {noMoreRecipes && (
        <View style={styles.noMoreBanner}>
          <Text style={styles.noMoreText}>
            No more new recipes for these ingredients — try a new photo!
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Finding recipes…</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/recipe/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardTime}>{item.cookTimeMinutes + item.prepTimeMinutes} min</Text>
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.matchBadge}>
                  Uses {item.matchedIngredientCount}/{item.totalIngredientCount} ingredients
                </Text>
                <View style={styles.tagRow}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  retakeText: {
    color: "#a0a0b8",
    fontSize: 15,
    fontWeight: "500",
  },
  refreshText: {
    color: "#e94560",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.4,
  },
  noMoreBanner: {
    backgroundColor: "#533483",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  noMoreText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#a0a0b8",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 13,
    color: "#e94560",
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
    color: "#a0a0b8",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchBadge: {
    fontSize: 12,
    color: "#4ecca3",
    fontWeight: "600",
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
  },
  tag: {
    backgroundColor: "#53348340",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: "#c0a0e8",
  },
});
