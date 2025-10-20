import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

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
  primary: 'bg-violet-600',
  secondary: 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
  danger: 'border border-red-200 bg-white dark:border-red-900 dark:bg-slate-900',
  ghost: 'bg-transparent',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900 dark:text-slate-100',
  danger: 'text-red-500 dark:text-red-400',
  ghost: 'text-violet-600 dark:text-violet-400',
};

const HEIGHT: Record<ButtonSize, string> = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
};

const TEXT_SIZE: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
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
    variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.danger : variant === 'ghost' ? colors.primary : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      className={`flex-row items-center justify-center rounded-2xl ${HEIGHT[size]} ${
        paddingFor(size)
      } ${SURFACE[variant]} ${blocked ? 'opacity-60' : 'active:opacity-80'} ${className ?? ''}`}
      style={style}>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={17} color={contentColor} /> : null}
          <Text className={`font-semibold ${TEXT_SIZE[size]} ${LABEL[variant]} ${icon ? 'ml-2' : ''}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function paddingFor(size: ButtonSize): string {
  if (size === 'sm') return 'px-4';
  if (size === 'md') return 'px-5';
  return 'px-6';
}
