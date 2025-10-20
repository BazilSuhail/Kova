import { useColorScheme } from 'react-native';
import { useUniwind } from 'uniwind';

/**
 * The only place raw colour values live.
 *
 * Anything that accepts a `className` uses plain Tailwind (`bg-white dark:bg-slate-900`)
 * — Uniwind resolves light/dark on its own. This hook exists purely for the few APIs
 * that need a real colour value in JS: `@expo/vector-icons` `color` props and chart strokes.
 *
 * Accent policy: `primary` = violet (brand, active tab, FAB, AI actions);
 * `success` = emerald (completion, streaks); red/amber = danger/warning.
 */
export type ThemeColors = {
  primary: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  danger: string;
  warning: string;
  info: string;
  text: string;
  textMuted: string;
  border: string;
};

export const palette: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#7C3AED', // violet-600
    primarySoft: '#EDE9FE', // violet-100
    onPrimary: '#FFFFFF',
    success: '#059669', // emerald-600
    successSoft: '#D1FAE5', // emerald-100
    danger: '#DC2626', // red-600
    warning: '#D97706', // amber-600
    info: '#2563EB', // blue-600
    text: '#0F172A', // slate-900
    textMuted: '#64748B', // slate-500
    border: '#E2E8F0', // slate-200
  },
  dark: {
    primary: '#A78BFA', // violet-400
    primarySoft: '#2E1065', // violet-950
    onPrimary: '#FFFFFF',
    success: '#34D399', // emerald-400
    successSoft: '#064E3B', // emerald-900
    danger: '#F87171', // red-400
    warning: '#FBBF24', // amber-400
    info: '#60A5FA', // blue-400
    text: '#F1F5F9', // slate-100
    textMuted: '#94A3B8', // slate-400
    border: '#1E293B', // slate-800
  },
};

/** True when the app should render its dark palette. */
export function useIsDark(): boolean {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const systemScheme = useColorScheme();

  // Explicit light/dark wins; `system` follows the device.
  return hasAdaptiveThemes ? systemScheme === 'dark' : theme === 'dark';
}

/** Theme-aware palette for APIs that can't take Tailwind classes (icons, charts). */
export function useThemeColors(): ThemeColors {
  const isDark = useIsDark();
  return isDark ? palette.dark : palette.light;
}
