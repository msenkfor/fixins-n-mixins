import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useRecipeSession } from "../src/context/RecipeSessionContext";
import { MOCK_INGREDIENTS } from "../src/data/mockData";

export default function CameraScreen() {
  const router = useRouter();
  const { isLoading, setPhoto, setIngredients, setLoading, resetSession } = useRecipeSession();

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      handlePhoto(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      handlePhoto(result.assets[0].uri);
    }
  };

  const handlePhoto = async (uri: string) => {
    resetSession();
    setPhoto(uri);
    setLoading(true);

    // TODO: Replace with real ingredient detection via Claude vision API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIngredients(MOCK_INGREDIENTS);
    setLoading(false);

    router.push("/ingredients");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.emoji}>🍳</Text>
        <Text style={styles.title}>Fixins n Mixins</Text>
        <Text style={styles.subtitle}>Snap your ingredients, get recipes</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Detecting ingredients…</Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickFromLibrary}>
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.secondaryButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0b8",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#e94560",
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#533483",
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#a0a0b8",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#a0a0b8",
  },
});
