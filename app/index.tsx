import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { detectIngredients } from "@/src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import { useEffect } from "react";

export default function CameraScreen() {
  const router = useRouter();
  const { isLoading, error, setPhoto, setIngredients, setLoading, setError, resetSession } =
    useRecipeSession();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!isLoading) {
      pulseScale.value = 1;
      return;
    }
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, [isLoading, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const takePhoto = async () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
      router.push("/ingredients");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Decorative top arc */}
      <View
        style={{
          position: "absolute",
          top: -120,
          left: -40,
          right: -40,
          height: 320,
          backgroundColor: colors.primaryMuted,
          borderBottomLeftRadius: 200,
          borderBottomRightRadius: 200,
          borderCurve: "continuous",
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.xxl,
          justifyContent: "center",
        }}
      >
        {/* Hero section */}
        <View style={{ alignItems: "center", marginBottom: 56 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderCurve: "continuous",
              backgroundColor: colors.bgCard,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.xl,
              boxShadow: shadows.card,
            }}
          >
            {/* Decorative emoji — not a structural icon */}
            <Text style={{ fontSize: 44 }}>🍳</Text>
          </View>
          <Text
            style={{
              ...typography.hero,
              fontSize: 40,
              textAlign: "center",
              marginBottom: spacing.sm,
              lineHeight: 46,
            }}
          >
            Fixins n{"\n"}Mixins
          </Text>
          <Text
            style={{
              ...typography.body,
              textAlign: "center",
              maxWidth: 260,
            }}
          >
            Snap your ingredients, discover delicious recipes
          </Text>
        </View>

        {/* Error banner */}
        {error && !isLoading && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Action area */}
        {isLoading ? (
          <View style={{ alignItems: "center", gap: spacing.md }}>
            <Animated.View
              style={[
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderCurve: "continuous",
                  backgroundColor: colors.primaryMuted,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: spacing.sm,
                },
                pulseStyle,
              ]}
            >
              <SFIcon
                name="magnifyingglass"
                size={36}
                tintColor={colors.primary as string}
                weight="medium"
              />
            </Animated.View>
            <Text style={{ ...typography.h3, color: colors.text }}>
              Scanning your photo…
            </Text>
            <Text style={typography.bodySmall}>
              Identifying ingredients with AI
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Pressable
              onPress={takePhoto}
              accessibilityRole="button"
              accessibilityLabel="Take a photo of your ingredients"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: radii.lg,
                borderCurve: "continuous",
                paddingVertical: 20,
                paddingHorizontal: spacing.xxl,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.lg,
                boxShadow: shadows.card,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <SFIcon
                name="camera.fill"
                size={24}
                tintColor="#FFFFFF"
                weight="medium"
              />
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: colors.textOnPrimary,
                  }}
                >
                  Take a Photo
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: 2,
                  }}
                >
                  Point at your fridge or pantry
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={pickFromLibrary}
              accessibilityRole="button"
              accessibilityLabel="Choose a photo from your library"
              style={({ pressed }) => ({
                backgroundColor: colors.bgCard,
                borderRadius: radii.lg,
                borderCurve: "continuous",
                borderWidth: 1.5,
                borderColor: colors.border,
                paddingVertical: 18,
                paddingHorizontal: spacing.xxl,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <SFIcon
                name="photo.on.rectangle"
                size={24}
                tintColor={colors.textSecondary as string}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Choose from Library
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Bottom accent */}
      <Text
        style={{
          ...typography.caption,
          textAlign: "center",
          paddingBottom: 48,
        }}
      >
        What will you cook today?
      </Text>
    </ScrollView>
  );
}
