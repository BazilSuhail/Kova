import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
};

/** Pill for filters and categories. Read-only when no `onPress` is given. */
export function Chip({ label, selected = false, onPress, icon }: Props) {
  const colors = useThemeColors();
  const iconColor = selected ? colors.onPrimary : colors.textMuted;

  const surface = `flex-row items-center rounded-full px-3 py-1.5 ${
    selected
      ? 'bg-violet-600'
      : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
  }`;

  const body = (
    <>
      {icon ? <Ionicons name={icon} size={13} color={iconColor} /> : null}
      <Text
        className={`text-xs font-semibold ${
          selected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
        }`}>
        {label}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View className={surface} style={{ gap: 6 }}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`${surface} active:opacity-70`}
      style={{ gap: 6 }}>
      {body}
    </Pressable>
  );
}
