/**
 * Warm, appetizing color palette inspired by cooking/lifestyle apps.
 * Uses Color API from expo-router for semantic platform colors where applicable,
 * with hex fallbacks for web and custom brand colors.
 */
import { Platform } from "react-native";
import { Color } from "expo-router";

export const colors = {
  // Backgrounds — use semantic platform backgrounds
  bg: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: "#FFFAF5",
  })!,
  bgCard: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surfaceContainer,
    default: "#FFFFFF",
  })!,
  bgMuted: "#FFF5ED", // brand-specific peach tint, no platform equivalent
  bgOverlay: "rgba(0, 0, 0, 0.04)",

  // Primary — warm terracotta/coral (brand color, not a system semantic)
  primary: Platform.select({
    ios: Color.ios.systemOrange,
    android: Color.android.dynamic.primary,
    default: "#E86A33",
  })!,
  primaryLight: "#FF8C5A",
  primaryMuted: "rgba(232, 106, 51, 0.1)",

  // Accent — sage green
  accent: Platform.select({
    ios: Color.ios.systemGreen,
    android: Color.android.dynamic.tertiary,
    default: "#5B8C5A",
  })!,
  accentLight: "#7DB87D",
  accentMuted: "rgba(91, 140, 90, 0.12)",

  // Text — use semantic label colors
  text: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#2D2016",
  })!,
  textSecondary: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#8A7968",
  })!,
  textMuted: Platform.select({
    ios: Color.ios.tertiaryLabel,
    android: Color.android.dynamic.outline,
    default: "#B8A898",
  })!,
  textOnPrimary: "#FFFFFF",

  // Borders & Dividers
  border: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#F0E6DA",
  })!,
  borderLight: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#F7F0E8",
  })!,

  // Tags — brand-specific
  tagBg: "#FFF0E6",
  tagText: "#C45A20",

  // Match / success
  matchBg: "#EFF8EF",
  matchText: "#3D7A3D",

  // Pantry badge
  pantryBg: "#FFF3E0",
  pantryText: "#B8860B",

  // Danger / remove
  danger: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: "#D4534B",
  })!,
  dangerMuted: "rgba(212, 83, 75, 0.08)",

  // Skeleton shimmer
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

export const typography = {
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

/** CSS boxShadow strings — replaces legacy RN shadow/elevation props */
export const shadows = {
  card: "0px 2px 8px rgba(45, 32, 22, 0.08)",
  cardHover: "0px 4px 16px rgba(45, 32, 22, 0.12)",
  soft: "0px 1px 4px rgba(45, 32, 22, 0.08)",
} as const;
