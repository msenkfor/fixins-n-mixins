/**
 * Warm, appetizing color palette inspired by cooking/lifestyle apps.
 * Earthy tones with pops of warmth — no default RN blue/purple.
 */
export const colors = {
  // Backgrounds
  bg: "#FFFAF5", // warm off-white
  bgCard: "#FFFFFF",
  bgMuted: "#FFF5ED", // peach-tinted surface
  bgOverlay: "rgba(0, 0, 0, 0.04)",

  // Primary — warm terracotta/coral
  primary: "#E86A33",
  primaryLight: "#FF8C5A",
  primaryMuted: "rgba(232, 106, 51, 0.1)",

  // Accent — sage green for badges/indicators
  accent: "#5B8C5A",
  accentLight: "#7DB87D",
  accentMuted: "rgba(91, 140, 90, 0.12)",

  // Text
  text: "#2D2016", // rich brown-black
  textSecondary: "#8A7968", // warm gray
  textMuted: "#B8A898", // lighter warm gray
  textOnPrimary: "#FFFFFF",

  // Borders & Dividers
  border: "#F0E6DA",
  borderLight: "#F7F0E8",

  // Tags
  tagBg: "#FFF0E6",
  tagText: "#C45A20",

  // Match / success
  matchBg: "#EFF8EF",
  matchText: "#3D7A3D",

  // Pantry badge
  pantryBg: "#FFF3E0",
  pantryText: "#B8860B",

  // Danger / remove
  danger: "#D4534B",
  dangerMuted: "rgba(212, 83, 75, 0.08)",

  // Skeleton shimmer
  skeletonBase: "#F0E6DA",
  skeletonHighlight: "#FAF3EC",

  // Shadow
  shadow: "rgba(45, 32, 22, 0.08)",
  shadowMedium: "rgba(45, 32, 22, 0.12)",
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

export const typography = {
  // System font stack — clean and native-feeling
  hero: {
    fontSize: 34,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h1: {
    fontSize: 26,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    color: colors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
  },
  h3: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textMuted,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;
