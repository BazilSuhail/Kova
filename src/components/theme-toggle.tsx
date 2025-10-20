import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useThemePreference } from '@/providers/theme-provider';
import { useIsDark, useThemeColors } from '@/theme/colors';

export function ThemeToggle() {
  const { setTheme, isHydrated } = useThemePreference();
  const isDark = useIsDark();
  const colors = useThemeColors();

  if (!isHydrated) return null;

  return (
    <Pressable
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-70 dark:bg-slate-800">
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={18}
        color={isDark ? colors.warning : colors.textMuted}
      />
    </Pressable>
  );
}
