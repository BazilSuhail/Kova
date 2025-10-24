import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable } from 'react-native';

import { useThemeColors } from '@/config/theme';

type Props = {
  checked: boolean;
  onPress: () => void;
  busy?: boolean;
  accessibilityLabel?: string;
};

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
        checked ? 'border-brand-ink bg-brand' : 'border-border bg-surface'
      } ${busy ? 'opacity-60' : 'active:opacity-70'}`}
    >
      {busy ? (
        <ActivityIndicator size="small" color={checked ? colors.onBrand : colors.muted} />
      ) : checked ? (
        <Ionicons name="checkmark" size={13} color={colors.onBrand} />
      ) : null}
    </Pressable>
  );
}
