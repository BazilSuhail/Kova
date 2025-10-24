import { useColorScheme } from 'react-native';
import { useUniwind } from 'uniwind';

export const palette = {
  forest: '#123F36',
  pine: '#2A6B5C',
  white: '#FFFFFF',
  ink: '#0A0A0A',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  onSurfaceAlt: string;
  border: string;
  focus: string;

  heading: string;
  body: string;
  muted: string;

  brand: string;
  brandInk: string;
  onBrand: string;
  accent: string;
  onAccent: string;

  nav: string;
  onNav: string;
  navActive: string;
  navMuted: string;

  infoFill: string;
  onInfoFill: string;
  successFill: string;
  onSuccessFill: string;
  warningFill: string;
  onWarningFill: string;
  dangerFill: string;
  onDangerFill: string;
  dangerInk: string;

  success: string;
  successInk: string;
  warning: string;
  danger: string;
  info: string;

  ink: string;
  skeleton: string;
};

const light: ThemeColors = {
  background: palette.white,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  onSurfaceAlt: palette.forest,
  border: palette.gray200,
  focus: palette.pine,

  heading: palette.forest,
  body: palette.pine,
  muted: palette.gray600,

  brand: palette.forest,
  brandInk: palette.forest,
  onBrand: palette.white,
  accent: palette.pine,
  onAccent: palette.white,

  nav: palette.forest,
  onNav: palette.white,
  navActive: palette.white,
  navMuted: palette.gray200,

  infoFill: palette.gray100,
  onInfoFill: palette.forest,
  successFill: palette.forest,
  onSuccessFill: palette.white,
  warningFill: palette.gray600,
  onWarningFill: palette.white,
  dangerFill: palette.gray900,
  onDangerFill: palette.white,
  dangerInk: palette.forest,

  success: palette.forest,
  successInk: palette.forest,
  warning: palette.gray600,
  danger: palette.gray900,
  info: palette.pine,

  ink: palette.ink,
  skeleton: palette.gray200,
};

const dark: ThemeColors = {
  background: palette.ink,
  surface: palette.gray900,
  surfaceAlt: palette.gray800,
  onSurfaceAlt: palette.gray200,
  border: palette.gray600,
  focus: palette.gray300,

  heading: palette.gray100,
  body: palette.gray300,
  muted: palette.gray400,

  brand: palette.pine,
  brandInk: palette.gray200,
  onBrand: palette.white,
  accent: palette.pine,
  onAccent: palette.white,

  nav: palette.pine,
  onNav: palette.white,
  navActive: palette.white,
  navMuted: palette.gray200,

  infoFill: palette.gray800,
  onInfoFill: palette.gray200,
  successFill: palette.pine,
  onSuccessFill: palette.white,
  warningFill: palette.gray600,
  onWarningFill: palette.white,
  dangerFill: palette.gray700,
  onDangerFill: palette.white,
  dangerInk: palette.gray100,

  success: palette.pine,
  successInk: palette.gray200,
  warning: palette.gray400,
  danger: palette.gray100,
  info: palette.gray400,

  ink: palette.ink,
  skeleton: palette.gray700,
};

export const themes: { light: ThemeColors; dark: ThemeColors } = { light, dark };

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
  xl: 24,
  full: 999,
} as const;

export const controlSizes = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
} as const;

export function useIsDark(): boolean {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const systemScheme = useColorScheme();
  return hasAdaptiveThemes ? systemScheme === 'dark' : theme === 'dark';
}

export function useThemeColors(): ThemeColors {
  return useIsDark() ? themes.dark : themes.light;
}
