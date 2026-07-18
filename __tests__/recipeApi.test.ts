import {
  ApiError,
  detectIngredients,
  generateRecipes,
  refreshRecipes,
} from "@/src/services/recipeApi";
import { MOCK_INGREDIENTS, MOCK_RECIPES_SET_A } from "@/src/data/mockData";

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({ uri: `compressed:${uri}` })),
  SaveFormat: { JPEG: "jpeg" },
}));

jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: jest.fn().mockResolvedValue("fake-base64"),
  })),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("recipeApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("detectIngredients", () => {
    it("compresses the photo, posts base64, and returns ingredients", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ ingredients: MOCK_INGREDIENTS }),
      );

      const result = await detectIngredients("file:///photo.jpg");

      expect(result).toEqual(MOCK_INGREDIENTS);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/functions/v1/detect-ingredients");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        imageBase64: "fake-base64",
        mimeType: "image/jpeg",
      });
    });

    it("maps technical 402 errors to friendly credit copy", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(
          { error: "Error code: 400 - invalid_request_error: credit balance" },
          402,
        ),
      );

      await expect(detectIngredients("file:///photo.jpg")).rejects.toMatchObject({
        name: "ApiError",
        statusCode: 402,
        message: expect.stringContaining("AI credits"),
      });
    });

    it("preserves friendly server messages", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ error: "Please try a clearer photo of your fridge." }, 400),
      );

      await expect(detectIngredients("file:///photo.jpg")).rejects.toMatchObject({
        message: "Please try a clearer photo of your fridge.",
        statusCode: 400,
      });
    });

    it("throws a connection error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Network request failed"));

      await expect(detectIngredients("file:///photo.jpg")).rejects.toEqual(
        new ApiError(
          "Could not connect to the server. Check your internet connection and try again.",
          0,
        ),
      );
    });
  });

  describe("generateRecipes", () => {
    it("posts ingredients and exclude titles", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ recipes: MOCK_RECIPES_SET_A, noMoreRecipes: false }),
      );

      const result = await generateRecipes(MOCK_INGREDIENTS, ["Old Recipe"]);

      expect(result).toEqual(MOCK_RECIPES_SET_A);
      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({
        ingredients: MOCK_INGREDIENTS,
        shownRecipeTitles: ["Old Recipe"],
      });
    });

    it("maps 429 to a rate-limit message", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ error: "rate_limit_error" }, 429),
      );

      await expect(generateRecipes(MOCK_INGREDIENTS)).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringContaining("Too many requests"),
      });
    });
  });

  describe("refreshRecipes", () => {
    it("returns recipes when the server has more", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ recipes: MOCK_RECIPES_SET_A, noMoreRecipes: false }),
      );

      await expect(refreshRecipes(MOCK_INGREDIENTS, ["A"])).resolves.toEqual(
        MOCK_RECIPES_SET_A,
      );
    });

    it("returns an empty array when noMoreRecipes is true", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ recipes: [], noMoreRecipes: true }),
      );

      await expect(refreshRecipes(MOCK_INGREDIENTS)).resolves.toEqual([]);
    });
  });
});
