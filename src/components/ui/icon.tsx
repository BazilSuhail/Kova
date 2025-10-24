import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

import { useThemeColors, type ThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

export type IconTone =
  | 'default'
  | 'heading'
  | 'brand'
  | 'accent'
  | 'nav'
  | 'onBrand'
  | 'onAccent'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

const TONES: Record<IconTone, keyof ThemeColors> = {
  default: 'body',
  heading: 'heading',
  brand: 'brandInk',
  accent: 'brandInk',
  nav: 'navActive',
  onBrand: 'onBrand',
  onAccent: 'onAccent',
  info: 'info',
  success: 'successInk',
  warning: 'warning',
  danger: 'danger',
};

type Props = {
  name: IconName;
  size?: number;
  tone?: IconTone;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 20, tone = 'default', color, style }: Props) {
  const colors = useThemeColors();

  return <Ionicons name={name} size={size} color={color ?? colors[TONES[tone]]} style={style} />;
}
