/**
 * Warm, appetizing color palette for Fixins n Mixins.
 * Brand hex tokens only — do not import from expo-router here
 * (that creates a circular dependency with app/_layout.tsx).
 */
export const fonts = {
  heading: {
    regular: "Fredoka_400Regular",
    medium: "Fredoka_500Medium",
    semibold: "Fredoka_600SemiBold",
    bold: "Fredoka_700Bold",
  },
  body: {
    regular: "Nunito_400Regular",
    medium: "Nunito_500Medium",
    semibold: "Nunito_600SemiBold",
    bold: "Nunito_700Bold",
    extrabold: "Nunito_800ExtraBold",
  },
} as const;

export const colors = {
  bg: "#FFFAF5",
  bgCard: "#FFFFFF",
  bgMuted: "#FFF5ED",
  bgOverlay: "rgba(0, 0, 0, 0.04)",

  primary: "#E86A33",
  primaryLight: "#FF8C5A",
  primaryMuted: "rgba(232, 106, 51, 0.1)",

  accent: "#5B8C5A",
  accentLight: "#7DB87D",
  accentMuted: "rgba(91, 140, 90, 0.12)",

  text: "#2D2016",
  textSecondary: "#8A7968",
  textMuted: "#B8A898",
  textOnPrimary: "#FFFFFF",

  border: "#F0E6DA",
  borderLight: "#F7F0E8",

  tagBg: "#FFF0E6",
  tagText: "#C45A20",

  matchBg: "#EFF8EF",
  matchText: "#3D7A3D",

  pantryBg: "#FFF3E0",
  pantryText: "#B8860B",

  danger: "#D4534B",
  dangerMuted: "rgba(212, 83, 75, 0.08)",

  skeletonBase: "#F0E6DA",
  skeletonHighlight: "#FAF3EC",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/** Weight is baked into fontFamily — don't set fontWeight with these. */
export const typography = {
  hero: {
    fontFamily: fonts.heading.bold,
    fontSize: 34,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h1: {
    fontFamily: fonts.heading.bold,
    fontSize: 26,
    letterSpacing: -0.3,
    color: colors.text,
  },
  h2: {
    fontFamily: fonts.heading.semibold,
    fontSize: 20,
    color: colors.text,
  },
  h3: {
    fontFamily: fonts.heading.semibold,
    fontSize: 17,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bodySmall: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.body.semibold,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    fontFamily: fonts.body.bold,
    fontSize: 17,
    color: colors.textOnPrimary,
  },
} as const;

/** CSS boxShadow strings — replaces legacy RN shadow/elevation props */
export const shadows = {
  card: "0px 2px 8px rgba(45, 32, 22, 0.08)",
  cardHover: "0px 4px 16px rgba(45, 32, 22, 0.12)",
  soft: "0px 1px 4px rgba(45, 32, 22, 0.08)",
  cta: "0px 3px 10px rgba(232, 106, 51, 0.28)",
} as const;
