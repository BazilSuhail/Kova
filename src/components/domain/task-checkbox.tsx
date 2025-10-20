import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable } from 'react-native';

import { useThemeColors } from '@/theme/colors';

type Props = {
  checked: boolean;
  onPress: () => void;
  /** Shows a spinner in place of the tick while the server confirms. */
  busy?: boolean;
  accessibilityLabel?: string;
};

/** Round completion control shared by the task list, the home list and the detail screen. */
export function TaskCheckbox({ checked, onPress, busy = false, accessibilityLabel }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, busy }}
      accessibilityLabel={accessibilityLabel}
      className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
        checked
          ? 'border-violet-600 bg-violet-600'
          : 'border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-900'
      } ${busy ? 'opacity-60' : 'active:opacity-70'}`}>
      {busy ? (
        <ActivityIndicator size="small" color={checked ? colors.onPrimary : colors.textMuted} />
      ) : checked ? (
        <Ionicons name="checkmark" size={13} color={colors.onPrimary} />
      ) : null}
    </Pressable>
  );
}
