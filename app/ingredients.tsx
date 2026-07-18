import { useCallback, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { detectIngredients, generateRecipes } from "@/src/services/recipeApi";
import { ErrorBanner } from "@/src/components/error-banner";
import { IngredientCard } from "@/src/components/ingredient-card";
import { IngredientsHeader } from "@/src/components/ingredients-header";
import { PrimaryButton } from "@/src/components/primary-button";
import { SecondaryButton } from "@/src/components/secondary-button";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, typography } from "@/src/theme";
import { DetectedIngredient } from "@/src/types/recipe";

export default function IngredientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const {
    photoUri,
    ingredients,
    isLoading,
    error,
    removeIngredient,
    setPhoto,
    setIngredients,
    setRecipes,
    addShownTitles,
    setLoading,
    setError,
    shownRecipeTitles,
    resetSession,
  } = useRecipeSession();

  const handleClose = () => {
    resetSession();
    router.replace("/");
  };

  const handleTryAgain = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowRetryOptions(true);
  };

  const handleConfirm = async () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setError(null);
    setLoading(true);
    router.replace("/recipes");

    try {
      const recipes = await generateRecipes(ingredients, shownRecipeTitles);
      setRecipes(recipes);
      addShownTitles(recipes.map((r) => r.title));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = async (uri: string) => {
    setShowRetryOptions(false);
    resetSession();
    setPhoto(uri);
    setLoading(true);
    setError(null);

    try {
      const detected = await detectIngredients(uri);
      setIngredients(detected);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera access is needed to photograph your ingredients.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      await handlePhoto(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library access is needed to choose an ingredient photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      await handlePhoto(result.assets[0].uri);
    }
  };

  const handleRemove = useCallback(
    (index: number) => {
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      removeIngredient(index);
    },
    [removeIngredient]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: DetectedIngredient; index: number }) => (
      <IngredientCard item={item} index={index} onRemove={handleRemove} />
    ),
    [handleRemove]
  );

  const keyExtractor = useCallback(
    (item: DetectedIngredient, i: number) => `${item.name}-${i}`,
    []
  );

  const isEmpty = ingredients.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <IngredientsHeader
        photoUri={photoUri}
        ingredientCount={ingredients.length}
        onClose={handleClose}
      />

      {error && !isLoading && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {isLoading && isEmpty ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.xl,
          }}
        >
          <LottieView
            source={require("@/assets/animations/scanning.json")}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
          <Text style={{ ...typography.h3, color: colors.text }}>
            Scanning your photo…
          </Text>
          <Text style={{ ...typography.bodySmall, textAlign: "center" }}>
            Identifying ingredients with AI
          </Text>
        </View>
      ) : (
        <FlatList
          data={ingredients}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingTop: isEmpty ? 0 : spacing.xl,
            gap: spacing.sm,
            paddingBottom: spacing.lg,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingTop: 40,
                gap: spacing.md,
                paddingHorizontal: spacing.xl,
              }}
            >
              <LottieView
                source={require("@/assets/animations/empty-basket.json")}
                autoPlay
                loop
                style={{ width: 140, height: 140 }}
              />
              <Text style={{ ...typography.h3, color: colors.text }}>
                No ingredients found
              </Text>
              <Text
                style={{
                  ...typography.bodySmall,
                  textAlign: "center",
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                Tap Try again to take a new photo{"\n"}or choose one from your
                library
              </Text>
            </View>
          }
        />
      )}

      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          gap: spacing.sm,
        }}
      >
        {isEmpty ? (
          showRetryOptions ? (
            <>
              <PrimaryButton
                label="Take a Photo"
                onPress={takePhoto}
                disabled={isLoading}
                icon={
                  <SFIcon
                    name="camera.fill"
                    size={18}
                    tintColor="#FFFFFF"
                    weight="medium"
                  />
                }
              />
              <SecondaryButton
                label="Choose from Library"
                onPress={pickFromLibrary}
                disabled={isLoading}
                icon={
                  <SFIcon
                    name="photo.on.rectangle"
                    size={18}
                    tintColor={colors.primary as string}
                    weight="medium"
                  />
                }
              />
              <Text
                onPress={() => setShowRetryOptions(false)}
                accessibilityRole="button"
                style={{
                  fontFamily: fonts.body.semibold,
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: "center",
                  paddingVertical: spacing.sm,
                }}
              >
                Cancel
              </Text>
            </>
          ) : (
            <PrimaryButton
              label="Try again"
              onPress={handleTryAgain}
              disabled={isLoading}
              icon={
                <SFIcon
                  name="arrow.clockwise"
                  size={18}
                  tintColor="#FFFFFF"
                  weight="semibold"
                />
              }
            />
          )
        ) : (
          <PrimaryButton
            label="Find Recipes"
            onPress={handleConfirm}
            disabled={isLoading}
            iconPosition="right"
            icon={
              <SFIcon
                name="arrow.right"
                size={18}
                tintColor="#FFFFFF"
                weight="bold"
              />
            }
          />
        )}
      </View>
    </View>
  );
}
