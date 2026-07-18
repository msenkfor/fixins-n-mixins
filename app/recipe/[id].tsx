import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRecipeSession } from "../../src/context/RecipeSessionContext";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes } = useRecipeSession();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Recipe not found.</Text>
      </View>
    );
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      {/* Metadata row */}
      <View style={styles.metaRow}>
        <MetaItem label="Servings" value={String(recipe.servings)} />
        <MetaItem label="Prep" value={`${recipe.prepTimeMinutes}m`} />
        <MetaItem label="Cook" value={`${recipe.cookTimeMinutes}m`} />
        <MetaItem label="Total" value={`${totalTime}m`} />
      </View>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {recipe.ingredients.map((ing, i) => (
        <View key={i} style={styles.ingredientRow}>
          <View style={styles.ingredientLeft}>
            <Text style={styles.ingredientQty}>
              {ing.quantity} {ing.unit}
            </Text>
            <Text style={styles.ingredientName}>{ing.name}</Text>
          </View>
          {!ing.fromPhoto && (
            <View style={styles.pantryBadge}>
              <Text style={styles.pantryText}>pantry</Text>
            </View>
          )}
        </View>
      ))}

      {/* Steps */}
      <Text style={styles.sectionTitle}>Instructions</Text>
      {recipe.steps.map((step) => (
        <View key={step.order} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.order}</Text>
          </View>
          <Text style={styles.stepText}>{step.instruction}</Text>
        </View>
      ))}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: "#a0a0b8",
    lineHeight: 22,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    justifyContent: "space-around",
  },
  metaItem: {
    alignItems: "center",
  },
  metaValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e94560",
  },
  metaLabel: {
    fontSize: 11,
    color: "#a0a0b8",
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#53348340",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#c0a0e8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  ingredientLeft: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  ingredientQty: {
    fontSize: 14,
    color: "#e94560",
    fontWeight: "600",
    minWidth: 60,
  },
  ingredientName: {
    fontSize: 14,
    color: "#fff",
    textTransform: "capitalize",
    flex: 1,
  },
  pantryBadge: {
    backgroundColor: "#4ecca320",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pantryText: {
    fontSize: 11,
    color: "#4ecca3",
    fontWeight: "600",
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e94560",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 15,
    color: "#d0d0e0",
    lineHeight: 22,
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    color: "#e94560",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
