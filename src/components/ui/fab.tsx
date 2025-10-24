import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-brand active:opacity-90"
      style={[
        {
          bottom,
          shadowColor: colors.ink,
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={26} color={colors.onBrand} />
    </Pressable>
  );
}
