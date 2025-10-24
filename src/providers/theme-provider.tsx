import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

const THEME_STORAGE_KEY = '@kova/theme';
const THEME_CHOICES = ['light', 'dark', 'system'] as const;

export type ThemeName = (typeof THEME_CHOICES)[number];

type ThemeValue = {
  theme: string;
  themeChoice: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  isHydrated: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

async function readTheme(): Promise<ThemeName | null> {
  if (Platform.OS === 'web') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_CHOICES.find((choice) => choice === stored) ?? null;
  }

  const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  return THEME_CHOICES.find((choice) => choice === stored) ?? null;
}

async function writeTheme(theme: ThemeName): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return;
  }
  await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
}

function usePersistedTheme(): ThemeValue {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    readTheme()
      .then((stored) => {
        if (stored) Uniwind.setTheme(stored);
      })
      .catch(() => {})
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeTheme(hasAdaptiveThemes ? 'system' : theme === 'dark' ? 'dark' : 'light').catch(() => {});
  }, [theme, hasAdaptiveThemes, isHydrated]);

  return {
    theme,
    themeChoice: hasAdaptiveThemes ? 'system' : theme === 'dark' ? 'dark' : 'light',
    setTheme: async (next) => Uniwind.setTheme(next),
    isHydrated,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = usePersistedTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
