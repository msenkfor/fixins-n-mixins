import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { detectIngredients } from "@/src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import { useRef } from "react";

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    error,
    setPhoto,
    setIngredients,
    setLoading,
    setError,
    resetSession,
  } = useRecipeSession();

  const scanningRef = useRef<LottieView>(null);

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
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Top section — brand + animation (takes ~55% of screen) */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: spacing.xl,
        }}
      >
        {/* Brand mark */}
        <Animated.View
          entering={FadeIn.duration(500).delay(100)}
          style={{ alignItems: "center", marginBottom: spacing.lg }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              letterSpacing: 3,
              textTransform: "uppercase",
              color: colors.primary,
              marginBottom: 6,
            }}
          >
            Fixins n Mixins
          </Text>
          <View
            style={{
              width: 24,
              height: 2,
              backgroundColor: colors.primary,
              borderRadius: 1,
              opacity: 0.4,
            }}
          />
        </Animated.View>

        {/* Chef animation — hero focal point */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200).springify().damping(18)}
          style={{
            width: 280,
            height: 180,
          }}
        >
          <LottieView
            source={require("@/assets/animations/splash-hero.json")}
            autoPlay
            loop
            style={{ width: 280, height: 180 }}
          />
        </Animated.View>
      </View>

      {/* Bottom section — content + CTAs (takes ~45%) */}
      <View
        style={{
          paddingHorizontal: spacing.xxl,
          paddingBottom: spacing.xxl,
        }}
      >
        {/* Headline */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400).springify().damping(16)}
          style={{ marginBottom: spacing.xxl }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              letterSpacing: -0.5,
              color: colors.text,
              lineHeight: 34,
            }}
          >
            What's in your kitchen?
          </Text>
          <Text
            style={{
              ...typography.body,
              fontSize: 16,
              marginTop: 8,
              color: colors.textSecondary,
            }}
          >
            Snap a photo and we'll find recipes you can make right now.
          </Text>
        </Animated.View>

        {/* Error banner */}
        {error && !isLoading && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Action area */}
        {isLoading ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              alignItems: "center",
              backgroundColor: colors.bgCard,
              borderRadius: radii.xl,
              borderCurve: "continuous",
              padding: spacing.xxl,
              boxShadow: shadows.soft,
              gap: spacing.md,
            }}
          >
            <LottieView
              ref={scanningRef}
              source={require("@/assets/animations/scanning.json")}
              autoPlay
              loop
              style={{ width: 80, height: 80 }}
            />
            <Text style={{ ...typography.h3, color: colors.text }}>
              Scanning your photo…
            </Text>
            <Text style={{ ...typography.bodySmall, textAlign: "center" }}>
              Identifying ingredients with AI
            </Text>
          </Animated.View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {/* Primary CTA */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(550).springify().damping(18)}
            >
              <Pressable
                onPress={takePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take a photo of your ingredients"
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  borderRadius: radii.lg,
                  borderCurve: "continuous",
                  paddingVertical: 18,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: spacing.sm,
                  boxShadow:
                    "0px 4px 12px rgba(232, 106, 51, 0.3)",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <SFIcon
                  name="camera.fill"
                  size={20}
                  tintColor="#FFFFFF"
                  weight="medium"
                />
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: colors.textOnPrimary,
                  }}
                >
                  Take a Photo
                </Text>
              </Pressable>
            </Animated.View>

            {/* Secondary CTA */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(650).springify().damping(18)}
            >
              <Pressable
                onPress={pickFromLibrary}
                accessibilityRole="button"
                accessibilityLabel="Choose a photo from your library"
                style={({ pressed }) => ({
                  paddingVertical: 16,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: spacing.sm,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <SFIcon
                  name="photo.on.rectangle"
                  size={18}
                  tintColor={colors.textMuted as string}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.textMuted,
                  }}
                >
                  Choose from Library
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}
