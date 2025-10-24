import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
};

export function Chip({ label, selected = false, onPress, icon }: Props) {
  const colors = useThemeColors();
  const iconColor = selected ? colors.onBrand : colors.muted;

  const surface = `flex-row items-center rounded-full px-3 py-1.5 ${
    selected ? 'bg-brand' : 'border border-border bg-surface'
  }`;

  const body = (
    <>
      {icon ? <Ionicons name={icon} size={13} color={iconColor} /> : null}
      <Text className={`text-xs font-semibold ${selected ? 'text-on-brand' : 'text-body'}`}>
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
      style={{ gap: 6 }}
    >
      {body}
    </Pressable>
  );
}
