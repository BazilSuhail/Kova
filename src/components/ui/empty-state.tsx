import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from './button';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type Props = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** Shown when a list or screen has nothing to display yet. */
export function EmptyState({ icon, title, description, actionLabel, onAction, className }: Props) {
  const colors = useThemeColors();

  return (
    <View className={`items-center px-6 py-10 ${className ?? ''}`}>
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 dark:bg-violet-950">
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-5 w-full">
          <Button label={actionLabel} onPress={onAction} variant="secondary" size="md" />
        </View>
      ) : null}
    </View>
  );
}
