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
  primary: 'bg-brand-soft',
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
      ? colors.brandInk
      : tone === 'success'
        ? colors.onSuccessFill
        : tone === 'danger'
          ? colors.onDangerFill
          : colors.onSurfaceAlt;

  const body = (
    <>
      {icon ? (
        <View className={`h-9 w-9 items-center justify-center rounded-md ${TONE_BG[tone]}`}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}

      <View className={`flex-1 ${icon ? 'ml-3' : ''}`}>
        <Text className="text-[15px] font-medium text-heading">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text> : null}
      </View>

      {right ??
        (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null)}
    </>
  );

  const divider = last ? '' : 'border-b border-border';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={`min-h-14 flex-row items-center px-4 py-3 active:bg-surface-alt ${divider}`}
      >
        {body}
      </Pressable>
    );
  }

  return <View className={`min-h-14 flex-row items-center px-4 py-3 ${divider}`}>{body}</View>;
}
