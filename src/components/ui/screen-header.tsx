import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { Href } from 'expo-router';

import { spacing } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { BackButton } from './back-button';
import { Icon } from './icon';

type Props = {
  icon?: IconName;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  backFallback?: Href;
};

export function ScreenHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  right,
  back = false,
  backFallback,
}: Props) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        {back ? (
          <View className="mb-3">
            <BackButton fallback={backFallback} />
          </View>
        ) : null}
        {icon || eyebrow ? (
          <View className="mb-2 flex-row items-center" style={{ gap: spacing.sm }}>
            {icon ? (
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-surface-alt">
                <Icon name={icon} size={16} tone="brand" />
              </View>
            ) : null}
            {eyebrow ? (
              <Text className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
                {eyebrow}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text className="text-3xl font-bold text-heading">{title}</Text>
        {subtitle ? <Text className="mt-1.5 text-sm text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
