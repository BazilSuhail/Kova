import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, type StyleProp, type ViewStyle } from 'react-native';

import { controlSizes, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { PressableScale } from './pressable-scale';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const SURFACE: Record<ButtonVariant, string> = {
  primary: 'bg-brand',
  secondary: 'border border-border bg-surface',
  danger: 'bg-danger',
  ghost: 'bg-transparent',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-on-brand',
  secondary: 'text-heading',
  danger: 'text-on-danger',
  ghost: 'text-brand-ink',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  className,
  style,
}: Props) {
  const colors = useThemeColors();
  const blocked = disabled || loading;

  const contentColor =
    variant === 'primary'
      ? colors.onBrand
      : variant === 'danger'
        ? colors.onDangerFill
        : variant === 'ghost'
          ? colors.brandInk
          : colors.heading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={blocked}
      haptic={variant === 'primary' || variant === 'danger'}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      className={`flex-row items-center justify-center rounded-md ${controlSizes[size]} ${SURFACE[variant]} ${blocked ? 'opacity-50' : ''} ${className ?? ''}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={contentColor} /> : null}
          <Text className={`font-semibold ${LABEL[variant]} ${icon ? 'ml-2' : ''}`}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}
