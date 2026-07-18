import { DetectedIngredient, Recipe } from "../types/recipe";

export const MOCK_INGREDIENTS: DetectedIngredient[] = [
  { name: "chicken breast", quantity: "2 lbs" },
  { name: "bell pepper", quantity: "3" },
  { name: "onion", quantity: "1" },
  { name: "garlic", quantity: "1 head" },
  { name: "rice", quantity: "2 cups" },
  { name: "soy sauce" },
  { name: "lime", quantity: "2" },
];

export const MOCK_RECIPES_SET_A: Recipe[] = [
  {
    id: "mock-1",
    title: "Chicken Stir-Fry",
    description:
      "Quick weeknight stir-fry with tender chicken and crisp peppers tossed in a savory soy-garlic sauce.",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    tags: ["30-min", "high-protein"],
    matchedIngredientCount: 6,
    totalIngredientCount: 8,
    ingredients: [
      { name: "chicken breast", quantity: "2", unit: "lbs", fromPhoto: true },
      { name: "bell pepper", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: true },
      { name: "soy sauce", quantity: "3", unit: "tbsp", fromPhoto: true },
      { name: "rice", quantity: "2", unit: "cups", fromPhoto: true },
      { name: "vegetable oil", quantity: "2", unit: "tbsp", fromPhoto: false },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Slice chicken breast into thin strips. Season with salt." },
      { order: 2, instruction: "Cook rice according to package directions." },
      { order: 3, instruction: "Heat oil in a large skillet or wok over high heat." },
      {
        order: 4,
        instruction:
          "Stir-fry chicken until golden, about 5 minutes. Remove and set aside.",
      },
      {
        order: 5,
        instruction: "Add sliced peppers, onion, and minced garlic. Cook 3 minutes.",
      },
      { order: 6, instruction: "Return chicken to pan, add soy sauce, toss to combine." },
      { order: 7, instruction: "Serve over rice." },
    ],
  },
  {
    id: "mock-2",
    title: "Chicken Fajitas",
    description:
      "Sizzling fajitas loaded with colorful peppers, onion, and a bright squeeze of lime.",
    servings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    tags: ["30-min", "mexican"],
    matchedIngredientCount: 5,
    totalIngredientCount: 9,
    ingredients: [
      { name: "chicken breast", quantity: "1.5", unit: "lbs", fromPhoto: true },
      { name: "bell pepper", quantity: "3", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "lime", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "2", unit: "cloves", fromPhoto: true },
      { name: "cumin", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "chili powder", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "olive oil", quantity: "2", unit: "tbsp", fromPhoto: false },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Slice chicken, peppers, and onion into strips." },
      {
        order: 2,
        instruction: "Mix cumin, chili powder, salt, and lime juice as a marinade.",
      },
      { order: 3, instruction: "Toss chicken in marinade, let sit 5 minutes." },
      { order: 4, instruction: "Heat oil in a cast iron skillet over high heat." },
      { order: 5, instruction: "Cook chicken until charred, about 6 minutes." },
      { order: 6, instruction: "Add peppers and onion, cook 4 more minutes." },
      { order: 7, instruction: "Squeeze remaining lime over everything and serve." },
    ],
  },
  {
    id: "mock-3",
    title: "Garlic Chicken Fried Rice",
    description:
      "Savory fried rice packed with roasted garlic and colorful bell peppers.",
    servings: 3,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    tags: ["one-pan", "asian"],
    matchedIngredientCount: 6,
    totalIngredientCount: 8,
    ingredients: [
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "rice", quantity: "2", unit: "cups", fromPhoto: true },
      { name: "garlic", quantity: "5", unit: "cloves", fromPhoto: true },
      { name: "bell pepper", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "soy sauce", quantity: "2", unit: "tbsp", fromPhoto: true },
      { name: "lime", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "sesame oil", quantity: "1", unit: "tbsp", fromPhoto: false },
      { name: "egg", quantity: "2", unit: "whole", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Cook rice and let it cool (day-old rice works best)." },
      {
        order: 2,
        instruction: "Dice chicken into small cubes, mince garlic, dice bell pepper.",
      },
      { order: 3, instruction: "Heat sesame oil in a wok over high heat." },
      { order: 4, instruction: "Scramble eggs, remove and set aside." },
      { order: 5, instruction: "Cook chicken until done, about 5 minutes." },
      { order: 6, instruction: "Add garlic and pepper, stir-fry 2 minutes." },
      {
        order: 7,
        instruction: "Add rice, soy sauce, and eggs. Toss until heated through.",
      },
      { order: 8, instruction: "Squeeze lime on top and serve." },
    ],
  },
  {
    id: "mock-4",
    title: "Lime-Soy Chicken Bowls",
    description:
      "Bright, tangy rice bowls with caramelized chicken and fresh lime.",
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: ["30-min", "bowl"],
    matchedIngredientCount: 7,
    totalIngredientCount: 9,
    ingredients: [
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "rice", quantity: "1.5", unit: "cups", fromPhoto: true },
      { name: "soy sauce", quantity: "3", unit: "tbsp", fromPhoto: true },
      { name: "lime", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: true },
      { name: "bell pepper", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "0.5", unit: "whole", fromPhoto: true },
      { name: "honey", quantity: "1", unit: "tbsp", fromPhoto: false },
      { name: "vegetable oil", quantity: "1", unit: "tbsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Cook rice." },
      {
        order: 2,
        instruction:
          "Whisk soy sauce, lime juice, honey, and minced garlic for the glaze.",
      },
      { order: 3, instruction: "Cut chicken into bite-sized pieces." },
      {
        order: 4,
        instruction:
          "Sear chicken in oil until golden. Pour glaze over and cook until sticky, about 3 minutes.",
      },
      { order: 5, instruction: "Slice pepper and onion, sauté until softened." },
      {
        order: 6,
        instruction:
          "Assemble bowls: rice, veggies, glazed chicken. Garnish with lime wedges.",
      },
    ],
  },
  {
    id: "mock-5",
    title: "Stuffed Bell Peppers",
    description:
      "Bell peppers stuffed with seasoned chicken, rice, and onion — comfort food at its best.",
    servings: 3,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    tags: ["meal-prep", "baked"],
    matchedIngredientCount: 5,
    totalIngredientCount: 8,
    ingredients: [
      { name: "bell pepper", quantity: "3", unit: "whole", fromPhoto: true },
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "rice", quantity: "1", unit: "cup", fromPhoto: true },
      { name: "onion", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "2", unit: "cloves", fromPhoto: true },
      { name: "tomato sauce", quantity: "1", unit: "cup", fromPhoto: false },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "pepper", quantity: "0.5", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      {
        order: 1,
        instruction: "Preheat oven to 375°F. Cut tops off peppers and remove seeds.",
      },
      { order: 2, instruction: "Cook rice. Dice chicken, onion, and garlic." },
      {
        order: 3,
        instruction:
          "Brown chicken in a skillet, add onion and garlic, cook until soft.",
      },
      {
        order: 4,
        instruction:
          "Mix chicken, rice, and half the tomato sauce. Season with salt and pepper.",
      },
      {
        order: 5,
        instruction: "Stuff each pepper with the mixture, place in a baking dish.",
      },
      { order: 6, instruction: "Spoon remaining tomato sauce over peppers." },
      {
        order: 7,
        instruction:
          "Cover with foil and bake 25 minutes. Uncover and bake 5 more.",
      },
    ],
  },
];

export const MOCK_RECIPES_SET_B: Recipe[] = [
  {
    id: "mock-6",
    title: "Teriyaki Chicken Rice",
    description:
      "Sweet and savory teriyaki-glazed chicken served over fluffy steamed rice.",
    servings: 3,
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    tags: ["asian", "sweet-savory"],
    matchedIngredientCount: 5,
    totalIngredientCount: 9,
    ingredients: [
      { name: "chicken breast", quantity: "1.5", unit: "lbs", fromPhoto: true },
      { name: "rice", quantity: "2", unit: "cups", fromPhoto: true },
      { name: "soy sauce", quantity: "4", unit: "tbsp", fromPhoto: true },
      { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: true },
      { name: "onion", quantity: "0.5", unit: "whole", fromPhoto: true },
      { name: "brown sugar", quantity: "2", unit: "tbsp", fromPhoto: false },
      { name: "ginger", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "cornstarch", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "sesame seeds", quantity: "1", unit: "tbsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Cook rice and keep warm." },
      {
        order: 2,
        instruction:
          "Whisk soy sauce, brown sugar, minced garlic, ginger, and cornstarch into a glaze.",
      },
      { order: 3, instruction: "Slice chicken into strips." },
      {
        order: 4,
        instruction: "Sear chicken in a hot pan until golden on each side, about 4 minutes per side.",
      },
      { order: 5, instruction: "Add diced onion, cook 2 minutes." },
      { order: 6, instruction: "Pour glaze over chicken, simmer until thickened." },
      { order: 7, instruction: "Serve over rice, sprinkle with sesame seeds." },
    ],
  },
  {
    id: "mock-7",
    title: "Pepper & Chicken Quesadillas",
    description:
      "Crispy tortillas filled with melty cheese, diced chicken, and sautéed peppers.",
    servings: 4,
    prepTimeMinutes: 12,
    cookTimeMinutes: 10,
    tags: ["quick", "mexican"],
    matchedIngredientCount: 4,
    totalIngredientCount: 8,
    ingredients: [
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "bell pepper", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "lime", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "flour tortillas", quantity: "4", unit: "large", fromPhoto: false },
      { name: "cheddar cheese", quantity: "1.5", unit: "cups", fromPhoto: false },
      { name: "cumin", quantity: "0.5", unit: "tsp", fromPhoto: false },
      { name: "butter", quantity: "2", unit: "tbsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Dice chicken, peppers, and onion." },
      { order: 2, instruction: "Season chicken with cumin and a squeeze of lime." },
      { order: 3, instruction: "Cook chicken in a skillet until done, set aside." },
      { order: 4, instruction: "Sauté peppers and onion until tender." },
      {
        order: 5,
        instruction:
          "Lay a tortilla flat, add cheese, chicken, peppers and onion on one half. Fold over.",
      },
      {
        order: 6,
        instruction: "Cook in buttered skillet until golden and cheese melts, about 2 minutes per side.",
      },
      { order: 7, instruction: "Slice into wedges and serve with lime." },
    ],
  },
  {
    id: "mock-8",
    title: "One-Pot Chicken & Rice",
    description:
      "A hands-off one-pot meal where chicken and rice cook together in a fragrant broth.",
    servings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    tags: ["one-pot", "comfort"],
    matchedIngredientCount: 6,
    totalIngredientCount: 10,
    ingredients: [
      { name: "chicken breast", quantity: "1.5", unit: "lbs", fromPhoto: true },
      { name: "rice", quantity: "1.5", unit: "cups", fromPhoto: true },
      { name: "bell pepper", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "4", unit: "cloves", fromPhoto: true },
      { name: "lime", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "chicken broth", quantity: "2.5", unit: "cups", fromPhoto: false },
      { name: "olive oil", quantity: "2", unit: "tbsp", fromPhoto: false },
      { name: "paprika", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Season chicken with paprika and salt." },
      { order: 2, instruction: "Sear chicken in olive oil until browned. Remove." },
      { order: 3, instruction: "Sauté diced onion, pepper, and garlic in the same pot." },
      { order: 4, instruction: "Add rice, stir to coat in oil for 1 minute." },
      { order: 5, instruction: "Pour in broth, nestle chicken on top." },
      {
        order: 6,
        instruction:
          "Cover, reduce heat, and simmer 20 minutes until rice is tender.",
      },
      { order: 7, instruction: "Squeeze lime over the pot and serve." },
    ],
  },
  {
    id: "mock-9",
    title: "Chicken Lettuce Wraps",
    description:
      "Light and crunchy lettuce cups filled with savory soy-garlic chicken.",
    servings: 3,
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    tags: ["low-carb", "light"],
    matchedIngredientCount: 5,
    totalIngredientCount: 9,
    ingredients: [
      { name: "chicken breast", quantity: "1", unit: "lb", fromPhoto: true },
      { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: true },
      { name: "soy sauce", quantity: "2", unit: "tbsp", fromPhoto: true },
      { name: "lime", quantity: "1", unit: "whole", fromPhoto: true },
      { name: "onion", quantity: "0.5", unit: "whole", fromPhoto: true },
      { name: "butter lettuce", quantity: "1", unit: "head", fromPhoto: false },
      { name: "rice vinegar", quantity: "1", unit: "tbsp", fromPhoto: false },
      { name: "sriracha", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "sesame oil", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Mince chicken (or use ground chicken)." },
      { order: 2, instruction: "Heat sesame oil and cook chicken, breaking apart, until browned." },
      { order: 3, instruction: "Add minced garlic and diced onion, stir 2 minutes." },
      {
        order: 4,
        instruction: "Mix soy sauce, rice vinegar, sriracha, and lime juice. Pour over chicken.",
      },
      { order: 5, instruction: "Cook until sauce is absorbed, about 1 minute." },
      { order: 6, instruction: "Separate lettuce leaves into cups." },
      { order: 7, instruction: "Spoon filling into leaves and serve immediately." },
    ],
  },
  {
    id: "mock-10",
    title: "Coconut Lime Chicken Skewers",
    description:
      "Juicy grilled chicken skewers marinated in coconut milk and lime.",
    servings: 4,
    prepTimeMinutes: 20,
    cookTimeMinutes: 12,
    tags: ["grilled", "tropical"],
    matchedIngredientCount: 4,
    totalIngredientCount: 9,
    ingredients: [
      { name: "chicken breast", quantity: "2", unit: "lbs", fromPhoto: true },
      { name: "lime", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "garlic", quantity: "3", unit: "cloves", fromPhoto: true },
      { name: "bell pepper", quantity: "2", unit: "whole", fromPhoto: true },
      { name: "coconut milk", quantity: "0.5", unit: "cup", fromPhoto: false },
      { name: "honey", quantity: "1", unit: "tbsp", fromPhoto: false },
      { name: "ginger", quantity: "1", unit: "tsp", fromPhoto: false },
      { name: "wooden skewers", quantity: "8", unit: "sticks", fromPhoto: false },
      { name: "salt", quantity: "1", unit: "tsp", fromPhoto: false },
    ],
    steps: [
      { order: 1, instruction: "Soak wooden skewers in water for 20 minutes." },
      {
        order: 2,
        instruction:
          "Mix coconut milk, lime juice, minced garlic, ginger, honey, and salt.",
      },
      { order: 3, instruction: "Cube chicken, toss in marinade, rest 15 minutes." },
      { order: 4, instruction: "Cut peppers into 1-inch chunks." },
      {
        order: 5,
        instruction: "Thread chicken and peppers alternately onto skewers.",
      },
      { order: 6, instruction: "Grill over medium-high heat, 5-6 minutes per side." },
      {
        order: 7,
        instruction: "Squeeze fresh lime over skewers before serving.",
      },
    ],
  },
];

// Legacy export for compatibility
export const MOCK_RECIPES = MOCK_RECIPES_SET_A;
