import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRecipeSession } from "../src/context/RecipeSessionContext";
import { detectIngredients } from "../src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "../src/theme";
import { useRef, useEffect } from "react";

export default function CameraScreen() {
  const router = useRouter();
  const { isLoading, setPhoto, setIngredients, setLoading, resetSession } =
    useRecipeSession();

  // Pulsing animation for the loading state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLoading) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isLoading, pulseAnim]);

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
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
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

    try {
      const ingredients = await detectIngredients(uri);
      setIngredients(ingredients);
    } finally {
      setLoading(false);
    }

    router.push("/ingredients");
  };

  return (
    <View style={styles.container}>
      {/* Decorative top arc */}
      <View style={styles.topDecoration} />

      <View style={styles.content}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.heroEmoji}>🍳</Text>
          </View>
          <Text style={styles.title}>Fixins n{"\n"}Mixins</Text>
          <Text style={styles.subtitle}>
            Snap your ingredients, discover delicious recipes
          </Text>
        </View>

        {/* Action area */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingIcon,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.loadingEmoji}>🔍</Text>
            </Animated.View>
            <Text style={styles.loadingTitle}>Scanning your photo…</Text>
            <Text style={styles.loadingSubtitle}>
              Identifying ingredients with AI
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={takePhoto}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonIcon}>📷</Text>
              <View>
                <Text style={styles.primaryButtonText}>Take a Photo</Text>
                <Text style={styles.buttonHint}>
                  Point at your fridge or pantry
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickFromLibrary}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.secondaryButtonText}>
                Choose from Library
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom accent */}
      <Text style={styles.footer}>What will you cook today?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topDecoration: {
    position: "absolute",
    top: -120,
    left: -40,
    right: -40,
    height: 320,
    backgroundColor: colors.primaryMuted,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 56,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  heroEmoji: {
    fontSize: 44,
  },
  title: {
    ...typography.hero,
    fontSize: 40,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 46,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    maxWidth: 260,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 20,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    ...shadows.card,
  },
  secondaryButton: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  buttonIcon: {
    fontSize: 24,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  buttonHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: "center",
    gap: spacing.md,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  loadingEmoji: {
    fontSize: 36,
  },
  loadingTitle: {
    ...typography.h3,
    color: colors.text,
  },
  loadingSubtitle: {
    ...typography.bodySmall,
  },
  footer: {
    ...typography.caption,
    textAlign: "center",
    paddingBottom: 48,
  },
});
