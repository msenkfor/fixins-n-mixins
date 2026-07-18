import { useCallback } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import LottieView from "lottie-react-native";
import { useRecipeSession } from "@/src/context/RecipeSessionContext";
import { detectIngredients, generateRecipes } from "@/src/services/recipeApi";
import { ErrorBanner } from "@/src/components/error-banner";
import { IngredientCard } from "@/src/components/ingredient-card";
import { PhotoThumbnail } from "@/src/components/photo-thumbnail";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts, spacing, radii, shadows, typography } from "@/src/theme";
import { DetectedIngredient } from "@/src/types/recipe";

export default function IngredientsScreen() {
  const router = useRouter();
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
    if (!permission.granted) return;

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
    if (!permission.granted) return;

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
      {photoUri ? (
        <PhotoThumbnail uri={photoUri} ingredientCount={ingredients.length} />
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderCurve: "continuous",
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                ...typography.button,
                fontSize: 20,
                fontVariant: ["tabular-nums"],
              }}
            >
              {ingredients.length}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.h2, marginBottom: 2 }}>
              Ingredients Found
            </Text>
            <Text style={typography.bodySmall}>
              Remove anything that doesn't look right
            </Text>
          </View>
        </View>
      )}

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
          <ActivityIndicator size="large" color={colors.primary as string} />
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
                Try another photo with clearer lighting{"\n"}or more food in frame
              </Text>
            </View>
          }
        />
      )}

      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: 36,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          gap: spacing.sm,
        }}
      >
        {isEmpty ? (
          <>
            <Pressable
              onPress={takePhoto}
              disabled={isLoading}
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
                gap: spacing.sm,
                boxShadow: "0px 3px 10px rgba(232, 106, 51, 0.28)",
                opacity: isLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed && !isLoading ? 0.96 : 1 }],
              })}
            >
              <SFIcon
                name="camera.fill"
                size={18}
                tintColor="#FFFFFF"
                weight="medium"
              />
              <Text style={typography.button}>Take a Photo</Text>
            </Pressable>

            <Pressable
              onPress={pickFromLibrary}
              disabled={isLoading}
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
                opacity: isLoading ? 0.5 : pressed ? 0.75 : 1,
                transform: [{ scale: pressed && !isLoading ? 0.96 : 1 }],
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
          </>
        ) : (
          <Pressable
            onPress={handleConfirm}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Find recipes with these ingredients"
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: radii.full,
              borderCurve: "continuous",
              paddingVertical: 18,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: spacing.sm,
              boxShadow: shadows.card,
              opacity: isLoading ? 0.5 : pressed ? 0.85 : 1,
              transform: [{ scale: pressed && !isLoading ? 0.96 : 1 }],
            })}
          >
            <Text style={typography.button}>Find Recipes</Text>
            <SFIcon
              name="arrow.right"
              size={18}
              tintColor="#FFFFFF"
              weight="bold"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
