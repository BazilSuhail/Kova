import { Sheet } from '@/components/ui/sheet';
import { useIsDark } from '@/config/theme';
import { selectFeedback } from '@/lib/haptics';
import { useTheme, type ThemeName } from '@/providers/theme-provider';
import type { IconName } from '@/theme/icons';

export const THEME_OPTIONS: { value: ThemeName; label: string; icon: IconName; detail: string }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline', detail: 'Always light' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline', detail: 'Always dark' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline', detail: 'Match this device' },
];

type Props = { visible: boolean; onClose: () => void };

/** Appearance sheet. Uniwind.setTheme flips colors and the root StatusBar follows useIsDark. */
export function ThemePicker({ visible, onClose }: Props) {
  const { themeChoice, setTheme } = useTheme();
  const isDark = useIsDark();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Theme"
      subtitle={themeChoice === 'system' ? `Following device (${isDark ? 'dark' : 'light'})` : undefined}
      icon="color-palette-outline"
      actions={THEME_OPTIONS.map((option) => ({
        icon: themeChoice === option.value ? 'checkmark-circle' : option.icon,
        label: option.label,
        subtitle: themeChoice === option.value ? `${option.detail} · In use` : option.detail,
        onPress: () => {
          if (option.value === themeChoice) return;
          selectFeedback();
          void setTheme(option.value);
        },
      }))}
    />
  );
}
