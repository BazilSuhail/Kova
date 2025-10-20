import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Uniwind, useUniwind } from 'uniwind';
import { Platform } from 'react-native';

const THEME_STORAGE_KEY = '@kova/theme';

export type ThemeName = 'light' | 'dark' | 'system';

async function getStoredTheme(): Promise<ThemeName | null> {
  if (Platform.OS === 'web') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeName;
    }
    return null;
  }
  try {
    const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeName;
    }
  } catch (error) {
    console.warn('Failed to load persisted theme:', error);
  }
  return null;
}

async function saveStoredTheme(theme: ThemeName) {
  if (Platform.OS === 'web') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return;
  }
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to persist theme:', error);
  }
}

export function usePersistedTheme() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const stored = await getStoredTheme();
        if (stored) {
          Uniwind.setTheme(stored);
        }
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
      } finally {
        setIsHydrated(true);
      }
    }
    loadStoredTheme();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    async function persistTheme() {
      try {
        const currentTheme = hasAdaptiveThemes ? 'system' : theme;
        await saveStoredTheme(currentTheme);
      } catch (error) {
        console.warn('Failed to persist theme:', error);
      }
    }
    persistTheme();
  }, [theme, hasAdaptiveThemes, isHydrated]);

  const setTheme = async (newTheme: ThemeName) => {
    Uniwind.setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    isHydrated,
  };
}
