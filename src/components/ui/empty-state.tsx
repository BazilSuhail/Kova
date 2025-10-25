import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from './button';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Props = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: Props) {
  const colors = useThemeColors();

  return (
    <View className={`items-center px-6 py-12 ${className ?? ''}`}>
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
        <Ionicons name={icon} size={26} color={colors.brandInk} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-heading">{title}</Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm leading-5 text-muted">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="md"
          className="mt-6"
        />
      ) : null}
    </View>
  );
}
