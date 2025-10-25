import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';

import { radii, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { PressableScale } from './pressable-scale';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: IconName;
  bottom?: number;
  style?: StyleProp<ViewStyle>;
};

export function Fab({ onPress, accessibilityLabel, icon = 'add', bottom = 24, style }: Props) {
  const colors = useThemeColors();

  return (
    <PressableScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute right-4 h-14 w-14 items-center justify-center bg-brand"
      style={[
        {
          bottom,
          borderRadius: radii.lg,
          shadowColor: colors.ink,
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={26} color={colors.onBrand} />
    </PressableScale>
  );
}
