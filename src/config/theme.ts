import { useColorScheme } from 'react-native';
import { useUniwind } from 'uniwind';

// Mirrors the light/dark variants in global.css. Change both together.
export const palette = {
  forest: '#123F36',
  pine: '#2A6B5C',
  white: '#FFFFFF',
  ink: '#0A0A0A',

  // Light neutrals
  mist: '#F7F8F6',
  sage50: '#EEF2EF',
  sage100: '#E1E6E2',
  sage200: '#DDEBE5',
  slate: '#2E4A43',
  stone: '#6B7C76',

  // Dark neutrals (soft, never pure black)
  night: '#121816',
  night50: '#1A2220',
  night100: '#222C29',
  night200: '#2E3A36',
  night300: '#1F3A33',
  nightInk: '#0F1513',
  frost: '#E8F0EC',
  fog: '#C3D1CB',
  haze: '#8A9C95',
  jade: '#4F9A85',
  mint: '#7FB5A3',

  // Accents
  apricot: '#E3B178',
  periwinkle: '#9DB0D8',
  rose: '#D79A9A',
  red: '#C0392B',
  redSoft: '#E58A80',
} as const;

/** Chart series, in order. Same in both modes. Mirrors --color-chart-1..5 in global.css. */
export const chartColors = [
  palette.pine,
  palette.mint,
  palette.apricot,
  palette.periwinkle,
  palette.rose,
] as const;

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
  brandSoft: string;
  onBrand: string;
  accent: string;
  onAccent: string;

  nav: string;
  onNav: string;
  navBackground: string;
  navForeground: string;
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

  error: string;
  errorSoft: string;
  errorBorder: string;
  errorInk: string;

  success: string;
  successInk: string;
  warning: string;
  danger: string;
  info: string;

  ink: string;
  skeleton: string;
  backdrop: string;
};

const light: ThemeColors = {
  background: palette.mist,
  surface: palette.white,
  surfaceAlt: palette.sage50,
  onSurfaceAlt: palette.forest,
  border: palette.sage100,
  focus: palette.pine,

  heading: palette.forest,
  body: palette.slate,
  muted: palette.stone,

  brand: palette.forest,
  brandInk: palette.forest,
  brandSoft: palette.sage200,
  onBrand: palette.white,
  accent: palette.pine,
  onAccent: palette.white,

  nav: palette.forest,
  onNav: palette.white,
  navBackground: palette.mist,
  navForeground: palette.forest,
  navActive: palette.forest,
  navMuted: palette.stone,

  infoFill: palette.sage50,
  onInfoFill: palette.forest,
  successFill: palette.sage200,
  onSuccessFill: palette.forest,
  warningFill: '#F6E9D6',
  onWarningFill: '#7A4E1D',
  dangerFill: '#F8E3E0',
  onDangerFill: palette.red,
  dangerInk: palette.red,

  error: palette.red,
  errorSoft: '#FBEEEC',
  errorBorder: '#F0C7C1',
  errorInk: palette.red,

  success: palette.pine,
  successInk: palette.forest,
  warning: '#B7791F',
  danger: palette.red,
  info: palette.pine,

  ink: palette.ink,
  skeleton: palette.sage100,
  backdrop: 'rgba(18, 24, 22, 0.45)',
};

const dark: ThemeColors = {
  background: palette.night,
  surface: palette.night50,
  surfaceAlt: palette.night100,
  onSurfaceAlt: palette.frost,
  border: palette.night200,
  focus: palette.mint,

  heading: palette.frost,
  body: palette.fog,
  muted: palette.haze,

  brand: palette.jade,
  brandInk: palette.mint,
  brandSoft: palette.night300,
  onBrand: palette.nightInk,
  accent: palette.mint,
  onAccent: palette.nightInk,

  nav: palette.jade,
  onNav: palette.nightInk,
  navBackground: palette.night,
  navForeground: palette.frost,
  navActive: palette.mint,
  navMuted: palette.haze,

  infoFill: palette.night100,
  onInfoFill: palette.frost,
  successFill: palette.night300,
  onSuccessFill: palette.mint,
  warningFill: '#3A3022',
  onWarningFill: palette.apricot,
  dangerFill: '#3A2321',
  onDangerFill: palette.redSoft,
  dangerInk: palette.redSoft,

  error: palette.redSoft,
  errorSoft: '#2E1D1B',
  errorBorder: '#5A302B',
  errorInk: palette.redSoft,

  success: palette.mint,
  successInk: palette.mint,
  warning: palette.apricot,
  danger: palette.redSoft,
  info: palette.mint,

  ink: palette.ink,
  skeleton: palette.night100,
  backdrop: 'rgba(0, 0, 0, 0.55)',
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

/** Screen side padding and gap between sections (DESIGN.md). */
export const layout = {
  gutter: spacing.lg,
  sectionGap: spacing.xxl,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 10,
  /** Sheet top corners only. */
  xl: 12,
  full: 999,
} as const;

export const controlSizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
} as const;

export function useIsDark(): boolean {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const systemScheme = useColorScheme();
  return hasAdaptiveThemes ? systemScheme === 'dark' : theme === 'dark';
}

export function useThemeColors(): ThemeColors {
  return useIsDark() ? themes.dark : themes.light;
}
