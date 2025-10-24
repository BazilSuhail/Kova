import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { useIsDark, useThemeColors } from '@/config/theme';

export function ThemeToggle() {
  const { setTheme, isHydrated } = useTheme();
  const isDark = useIsDark();
  const colors = useThemeColors();

  if (!isHydrated) return null;

  return (
    <Pressable
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="h-10 w-10 items-center justify-center rounded-full bg-surface-alt active:opacity-70"
    >
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.onSurfaceAlt} />
    </Pressable>
  );
}
