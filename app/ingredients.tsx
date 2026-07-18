import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRecipeSession } from "../src/context/RecipeSessionContext";
import { MOCK_RECIPES } from "../src/data/mockData";

export default function IngredientsScreen() {
  const router = useRouter();
  const { ingredients, removeIngredient, setRecipes, addShownTitles, setLoading } =
    useRecipeSession();

  const handleConfirm = async () => {
    setLoading(true);

    // TODO: Replace with real recipe generation via Claude API
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRecipes(MOCK_RECIPES);
    addShownTitles(MOCK_RECIPES.map((r) => r.title));
    setLoading(false);

    router.replace("/recipes");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>We found {ingredients.length} ingredients</Text>
      <Text style={styles.subheading}>Remove anything that looks wrong, then continue.</Text>

      <FlatList
        data={ingredients}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.ingredientRow}>
            <View style={styles.ingredientInfo}>
              <Text style={styles.ingredientName}>{item.name}</Text>
              {item.quantity && <Text style={styles.ingredientQty}>{item.quantity}</Text>}
            </View>
            <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.confirmButton, ingredients.length === 0 && styles.disabledButton]}
        onPress={handleConfirm}
        disabled={ingredients.length === 0}
      >
        <Text style={styles.confirmText}>Find Recipes →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#a0a0b8",
    marginBottom: 20,
  },
  list: {
    gap: 8,
    paddingBottom: 16,
  },
  ingredientRow: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: "#fff",
    textTransform: "capitalize",
  },
  ingredientQty: {
    fontSize: 13,
    color: "#a0a0b8",
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e9456020",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#e94560",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
