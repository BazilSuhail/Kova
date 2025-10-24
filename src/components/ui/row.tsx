import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

export type RowTone = 'neutral' | 'primary' | 'success' | 'danger';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tone?: RowTone;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
};

const TONE_BG: Record<RowTone, string> = {
  neutral: 'bg-surface-alt',
  primary: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
};

export function Row({
  title,
  subtitle,
  icon,
  tone = 'neutral',
  right,
  onPress,
  last = false,
}: Props) {
  const colors = useThemeColors();

  const iconColor =
    tone === 'primary'
      ? colors.onBrand
      : tone === 'success'
        ? colors.onSuccessFill
        : tone === 'danger'
          ? colors.onDangerFill
          : colors.onSurfaceAlt;

  const body = (
    <>
      {icon ? (
        <View className={`h-9 w-9 items-center justify-center rounded-xl ${TONE_BG[tone]}`}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
      ) : null}

      <View className={`flex-1 ${icon ? 'ml-3' : ''}`}>
        <Text className="text-sm font-semibold text-heading">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text> : null}
      </View>

      {right ??
        (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null)}
    </>
  );

  const divider = last ? '' : 'border-b border-border';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={`flex-row items-center px-4 py-3 active:opacity-70 ${divider}`}
      >
        {body}
      </Pressable>
    );
  }

  return <View className={`flex-row items-center px-4 py-3 ${divider}`}>{body}</View>;
}
