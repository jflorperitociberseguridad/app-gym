// Design tokens — Personal Gym Tracker. Warm graphite surfaces with a signal-red accent.
// Light and dark palettes share the same contrast and status-color roles.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#F6F5F3",
  onSurface: "#1A1716",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#302C2B",
  surfaceTertiary: "#F0ECEA",
  onSurfaceTertiary: "#5E5754",
  surfaceInverse: "#211D1C",
  onSurfaceInverse: "#FFFFFF",
  muted: "#7A716E",

  brand: "#E63946",
  onBrand: "#FFFFFF",
  brandPrimary: "#E63946",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF6B5F",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#FCEBED",
  onBrandTertiary: "#B52D38",

  success: "#168B62",
  onSuccess: "#FFFFFF",
  successTertiary: "#E7F6EF",
  warning: "#9A5B08",
  onWarning: "#FFFFFF",
  warningTertiary: "#FFF3DC",
  error: "#D53B47",
  onError: "#FFFFFF",
  errorTertiary: "#FDEBED",
  info: "#3F4750",
  onInfo: "#FFFFFF",
  infoTertiary: "#EDF1F4",

  border: "#E9E3DF",
  borderStrong: "#D8CFCA",
  divider: "#E9E3DF",
};

export type ThemeColors = typeof light;

const dark: ThemeColors = {
  surface: "#111112",
  onSurface: "#F6F4F2",
  surfaceSecondary: "#1C1B1B",
  onSurfaceSecondary: "#EFECE9",
  surfaceTertiary: "#2A2828",
  onSurfaceTertiary: "#D1C9C6",
  surfaceInverse: "#F6F4F2",
  onSurfaceInverse: "#191515",
  muted: "#AAA19E",

  brand: "#F04B57",
  onBrand: "#FFFFFF",
  brandPrimary: "#F04B57",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF777D",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#3D1F22",
  onBrandTertiary: "#FFD9DC",

  success: "#35B987",
  onSuccess: "#071D15",
  successTertiary: "#15372B",
  warning: "#F2BA58",
  onWarning: "#241700",
  warningTertiary: "#3B2F1A",
  error: "#F2646C",
  onError: "#24080A",
  errorTertiary: "#3B1D20",
  info: "#F4F0ED",
  onInfo: "#191515",
  infoTertiary: "#282527",

  border: "#302D2D",
  borderStrong: "#484342",
  divider: "#302D2D",
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
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
