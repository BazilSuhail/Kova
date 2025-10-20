import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

export type RowTone = 'neutral' | 'primary' | 'success' | 'danger';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tone?: RowTone;
  /** Trailing content; defaults to a chevron when the row is tappable. */
  right?: ReactNode;
  onPress?: () => void;
  /** Skip the bottom divider on the last row of a group. */
  last?: boolean;
};

const TONE_BG: Record<RowTone, string> = {
  neutral: 'bg-slate-100 dark:bg-slate-800',
  primary: 'bg-violet-50 dark:bg-violet-950',
  success: 'bg-emerald-50 dark:bg-emerald-950',
  danger: 'bg-red-50 dark:bg-red-950',
};

/** Settings-style row used inside cards and grouped lists. */
export function Row({ title, subtitle, icon, tone = 'neutral', right, onPress, last = false }: Props) {
  const colors = useThemeColors();

  const iconColor =
    tone === 'primary'
      ? colors.primary
      : tone === 'success'
        ? colors.success
        : tone === 'danger'
          ? colors.danger
          : colors.textMuted;

  const body = (
    <>
      {icon ? (
        <View className={`h-9 w-9 items-center justify-center rounded-xl ${TONE_BG[tone]}`}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
      ) : null}

      <View className={`flex-1 ${icon ? 'ml-3' : ''}`}>
        <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</Text>
        ) : null}
      </View>

      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null)}
    </>
  );

  const divider = last ? '' : 'border-b border-slate-200 dark:border-slate-800';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={`flex-row items-center px-4 py-3 active:opacity-70 ${divider}`}>
        {body}
      </Pressable>
    );
  }

  return <View className={`flex-row items-center px-4 py-3 ${divider}`}>{body}</View>;
}
