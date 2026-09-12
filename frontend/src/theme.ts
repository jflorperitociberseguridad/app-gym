// Design tokens — Personal Gym Tracker. iOS-Native Clean, Signal Red accent.
// Keys mirror the "color" block of /app/design_guidelines.json. Light + Dark.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FFFFFF",
  onSurface: "#111111",
  surfaceSecondary: "#F7F7F7",
  onSurfaceSecondary: "#111111",
  surfaceTertiary: "#EBEBEB",
  onSurfaceTertiary: "#111111",
  surfaceInverse: "#111111",
  onSurfaceInverse: "#FFFFFF",
  muted: "#6B6B6B",

  brand: "#E63946",
  onBrand: "#FFFFFF",
  brandPrimary: "#E63946",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF2A2A",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#FFEDED",
  onBrandTertiary: "#E63946",

  success: "#198754",
  onSuccess: "#FFFFFF",
  warning: "#B8860B",
  onWarning: "#FFFFFF",
  error: "#DC3545",
  onError: "#FFFFFF",
  info: "#111111",
  onInfo: "#FFFFFF",

  border: "#E5E5E5",
  borderStrong: "#D4D4D4",
  divider: "#E5E5E5",
};

export type ThemeColors = typeof light;

const dark: ThemeColors = {
  surface: "#101114",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#1C1D21",
  onSurfaceSecondary: "#FFFFFF",
  surfaceTertiary: "#28292E",
  onSurfaceTertiary: "#FFFFFF",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#111111",
  muted: "#9BA1A6",

  brand: "#E63946",
  onBrand: "#FFFFFF",
  brandPrimary: "#E63946",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF5757",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#3B0E12",
  onBrandTertiary: "#FFD6D6",

  success: "#2A9D8F",
  onSuccess: "#FFFFFF",
  warning: "#E9C46A",
  onWarning: "#111111",
  error: "#D62828",
  onError: "#FFFFFF",
  info: "#FFFFFF",
  onInfo: "#111111",

  border: "#2C2E33",
  borderStrong: "#41434A",
  divider: "#2C2E33",
};

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light, dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme);
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 } as const;
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 } as const;
