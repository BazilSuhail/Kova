import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { Row } from '@/components/ui/row';
import { selectFeedback } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';
import { useIsDark, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Choice = 'light' | 'dark' | 'system';

const OPTIONS: { value: Choice; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

const DETAIL: Record<Choice, string> = {
  light: 'Always light, whatever your device does',
  dark: 'Always dark, whatever your device does',
  system: 'Follows your device light or dark setting',
};

export function ThemePicker() {
  const { themeChoice, setTheme, isHydrated } = useTheme();
  const isDark = useIsDark();
  const colors = useThemeColors();

  function choose(next: Choice) {
    if (next === themeChoice) return;

    selectFeedback();
    void setTheme(next);
  }

  return (
    <>
      <Row
        title="Theme"
        subtitle={DETAIL[themeChoice]}
        icon={isDark ? 'moon' : 'sunny'}
        tone="primary"
        right={<ThemeToggle />}
        last
      />

      <View className="px-4 pb-4">
        <View className="flex-row rounded-2xl bg-surface-alt p-1">
          {OPTIONS.map((option) => {
            const selected = isHydrated && themeChoice === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => choose(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label} theme`}
                className={`flex-1 flex-row items-center justify-center rounded-xl py-2.5 active:opacity-70 ${
                  selected ? 'bg-surface' : ''
                }`}
                style={{ gap: 6 }}
              >
                <Ionicons
                  name={option.icon}
                  size={15}
                  color={selected ? colors.heading : colors.onSurfaceAlt}
                />
                <Text
                  className={`text-xs font-semibold ${
                    selected ? 'text-heading' : 'text-on-surface-alt'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {themeChoice === 'system' ? (
          <Text className="mt-2 text-xs text-muted">
            Currently {isDark ? 'dark' : 'light'} on this device.
          </Text>
        ) : null}
      </View>
    </>
  );
}
