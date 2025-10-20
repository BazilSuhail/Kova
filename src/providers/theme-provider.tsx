import { createContext, useContext, type ReactNode } from 'react';

import { usePersistedTheme } from '@/hooks/usePersistedTheme';

type ThemeContextValue = ReturnType<typeof usePersistedTheme>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the stored theme once, at the top of the tree.
 *
 * Without this the preference only loads when the toggle happens to mount, so a relaunch
 * would briefly render the device theme instead of the chosen one.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = usePersistedTheme();

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useThemePreference must be used inside <ThemeProvider>');
  return value;
}
