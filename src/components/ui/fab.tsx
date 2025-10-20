import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: IconName;
  /** Offset from the bottom edge; lift it above a tab bar or a list's last row. */
  bottom?: number;
  style?: StyleProp<ViewStyle>;
};

/** Floating capture button. Sits above the tab bar by default. */
export function Fab({ onPress, accessibilityLabel, icon = 'add', bottom = 24, style }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-violet-600 active:opacity-90"
      style={[
        {
          bottom,
          shadowColor: '#7C3AED',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}>
      <Ionicons name={icon} size={26} color={colors.onPrimary} />
    </Pressable>
  );
}
