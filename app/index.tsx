import { useRef } from "react";
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
import { ErrorBanner } from "@/src/components/error-banner";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, radii, shadows, typography } from "@/src/theme";

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
        backgroundColor: colors.bgMuted,
        overflow: "hidden",
      }}
    >
      {/* Soft washes behind everything — including under the white card */}
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.primaryMuted,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 140,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: colors.accentMuted,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 80,
          right: -20,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: colors.primaryMuted,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: colors.accentMuted,
        }}
      />

      {/* Hero */}
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing.sm,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: spacing.lg,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(600).delay(100)}
          style={{
            width: 280,
            height: 180,
            marginBottom: spacing.lg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: colors.primaryMuted,
            }}
          />
          <LottieView
            source={require("@/assets/animations/splash-hero.json")}
            autoPlay
            loop
            style={{ width: 280, height: 180 }}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(450).delay(300).springify().damping(16)}
          style={{ alignItems: "center", paddingHorizontal: spacing.xl }}
        >
          <Text
            style={{
              ...typography.hero,
              fontSize: 32,
              textAlign: "center",
            }}
          >
            Fixins n Mixins
          </Text>
          <Animated.View entering={FadeIn.duration(400).delay(600)}>
            <Text
              style={{
                ...typography.bodySmall,
                fontFamily: fonts.body.medium,
                color: colors.textSecondary,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Snap ingredients. Discover recipes.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* White card on top of the warm background */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: radii.xl,
            borderCurve: "continuous",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xl,
            gap: spacing.md,
            boxShadow: shadows.card,
          }}
        >
          {error && !isLoading && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          {isLoading ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
              }}
            >
              <LottieView
                ref={scanningRef}
                source={require("@/assets/animations/scanning.json")}
                autoPlay
                loop
                style={{ width: 88, height: 88 }}
              />
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ ...typography.h3, color: colors.text }}>
                  Scanning your photo…
                </Text>
                <Text
                  style={{
                    ...typography.bodySmall,
                    color: colors.textSecondary,
                  }}
                >
                  Identifying ingredients with AI
                </Text>
              </View>
            </Animated.View>
          ) : (
            <>
              <Animated.View
                entering={FadeInDown.duration(350)
                  .delay(500)
                  .springify()
                  .damping(18)}
              >
                <Pressable
                  onPress={takePhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Take a photo of your ingredients"
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary,
                    borderRadius: radii.full,
                    borderCurve: "continuous",
                    paddingVertical: 18,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0px 3px 10px rgba(232, 106, 51, 0.28)",
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
                      ...typography.button,
                      letterSpacing: 0.2,
                    }}
                  >
                    Take a Photo
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(350)
                  .delay(620)
                  .springify()
                  .damping(18)}
              >
                <Pressable
                  onPress={pickFromLibrary}
                  accessibilityRole="button"
                  accessibilityLabel="Choose a photo from your library"
                  style={({ pressed }) => ({
                    backgroundColor: colors.primaryMuted,
                    borderRadius: radii.full,
                    borderCurve: "continuous",
                    paddingVertical: 16,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    borderWidth: 1.5,
                    borderColor: "rgba(232, 106, 51, 0.35)",
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <SFIcon
                    name="photo.on.rectangle"
                    size={18}
                    tintColor={colors.primary as string}
                    weight="medium"
                  />
                  <Text
                    style={{
                      fontFamily: fonts.body.semibold,
                      fontSize: 15,
                      color: colors.primary,
                    }}
                  >
                    Choose from Library
                  </Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
