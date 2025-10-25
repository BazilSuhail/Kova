import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { PressableScale } from './pressable-scale';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
};

/** YouTube filter chip: pill, brand fill when selected, surface-alt otherwise. */
export function Chip({ label, selected = false, onPress, icon }: Props) {
  const colors = useThemeColors();
  const iconColor = selected ? colors.onBrand : colors.body;

  const surface = `h-8 flex-row items-center rounded-full px-3 ${
    selected ? 'bg-brand' : 'bg-surface-alt'
  }`;

  const body = (
    <>
      {icon ? <Ionicons name={icon} size={14} color={iconColor} /> : null}
      <Text className={`text-sm font-medium ${selected ? 'text-on-brand' : 'text-body'}`}>
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
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={surface}
      style={{ gap: 6 }}
    >
      {body}
    </PressableScale>
  );
}
