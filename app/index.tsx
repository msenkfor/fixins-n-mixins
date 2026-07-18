import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { detectIngredients } from "@/src/services/recipeApi";
import { colors, spacing, radii, shadows, typography } from "@/src/theme";
import { SFIcon } from "@/src/components/SFIcon";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import { useRef, useEffect } from "react";

/** Floating food accent that bobs gently */
function FloatingEmoji({
  emoji,
  size,
  top,
  left,
  delay,
}: {
  emoji: string;
  size: number;
  top: number;
  left: number;
  delay: number;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [y, delay]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      entering={BounceIn.delay(delay).duration(800)}
      style={[
        {
          position: "absolute",
          top,
          left,
          zIndex: 1,
        },
        floatStyle,
      ]}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function CameraScreen() {
  const router = useRouter();
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
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Warm gradient background */}
      <LinearGradient
        colors={["rgba(232, 106, 51, 0.12)", "rgba(232, 106, 51, 0.03)", "transparent"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
        }}
      />

      {/* Floating food accents */}
      <FloatingEmoji emoji="🥕" size={28} top={80} left={30} delay={200} />
      <FloatingEmoji emoji="🍅" size={24} top={60} left={310} delay={500} />
      <FloatingEmoji emoji="🧀" size={22} top={160} left={20} delay={800} />
      <FloatingEmoji emoji="🌶️" size={20} top={140} left={320} delay={400} />
      <FloatingEmoji emoji="🥑" size={26} top={240} left={40} delay={600} />
      <FloatingEmoji emoji="🍋" size={20} top={220} left={300} delay={900} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.xxl,
          justifyContent: "center",
        }}
      >
        {/* Hero section */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          {/* Chef animation — larger, no constraining circle */}
          <Animated.View
            entering={FadeIn.duration(600).delay(100)}
            style={{
              width: 160,
              height: 160,
              marginBottom: spacing.lg,
            }}
          >
            <LottieView
              source={require("@/assets/animations/splash-hero.json")}
              autoPlay
              loop
              style={{ width: 160, height: 160 }}
            />
          </Animated.View>

          {/* App title — slides up */}
          <Animated.Text
            entering={FadeInUp.duration(500).delay(300).springify().damping(14)}
            style={{
              ...typography.hero,
              fontSize: 42,
              textAlign: "center",
              marginBottom: spacing.sm,
              lineHeight: 48,
            }}
          >
            Fixins n{"\n"}Mixins
          </Animated.Text>

          {/* Subtitle — fades in after title */}
          <Animated.Text
            entering={FadeIn.duration(600).delay(700)}
            style={{
              ...typography.body,
              textAlign: "center",
              maxWidth: 280,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            Snap your ingredients,{"\n"}discover delicious recipes
          </Animated.Text>
        </View>

        {/* Error banner */}
        {error && !isLoading && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* Action area */}
        {isLoading ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{ alignItems: "center", gap: spacing.md }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
            >
              <LottieView
                ref={scanningRef}
                source={require("@/assets/animations/scanning.json")}
                autoPlay
                loop
                style={{ width: 110, height: 110 }}
              />
            </View>
            <Text style={{ ...typography.h3, color: colors.text }}>
              Scanning your photo…
            </Text>
            <Text style={typography.bodySmall}>
              Identifying ingredients with AI
            </Text>
          </Animated.View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {/* Primary CTA — slides up */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(500).springify().damping(16)}
            >
              <Pressable
                onPress={takePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take a photo of your ingredients"
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  borderRadius: radii.xl,
                  borderCurve: "continuous",
                  paddingVertical: 22,
                  paddingHorizontal: spacing.xxl,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.lg,
                  boxShadow:
                    "0px 4px 16px rgba(232, 106, 51, 0.35), 0px 1px 4px rgba(232, 106, 51, 0.2)",
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <SFIcon
                    name="camera.fill"
                    size={22}
                    tintColor="#FFFFFF"
                    weight="medium"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.textOnPrimary,
                    }}
                  >
                    Take a Photo
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "rgba(255, 255, 255, 0.75)",
                      marginTop: 2,
                    }}
                  >
                    Point at your fridge or pantry
                  </Text>
                </View>
                <SFIcon
                  name="arrow.right"
                  size={18}
                  tintColor="rgba(255, 255, 255, 0.6)"
                  weight="semibold"
                />
              </Pressable>
            </Animated.View>

            {/* Secondary CTA — slides up staggered */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(650).springify().damping(16)}
            >
              <Pressable
                onPress={pickFromLibrary}
                accessibilityRole="button"
                accessibilityLabel="Choose a photo from your library"
                style={({ pressed }) => ({
                  backgroundColor: colors.bgCard,
                  borderRadius: radii.xl,
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
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <SFIcon
                  name="photo.on.rectangle"
                  size={22}
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
            </Animated.View>
          </View>
        )}
      </View>

      {/* Bottom tagline */}
      <Animated.Text
        entering={FadeIn.duration(500).delay(1000)}
        style={{
          ...typography.caption,
          textAlign: "center",
          paddingBottom: 48,
        }}
      >
        What will you cook today?
      </Animated.Text>
    </ScrollView>
  );
}
