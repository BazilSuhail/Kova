import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from './button';
import { useThemeColors } from '@/config/theme';

type Props = {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ message, title = 'Something went wrong', onRetry, className }: Props) {
  const colors = useThemeColors();

  return (
    <View className={`items-center px-6 py-12 ${className ?? ''}`}>
      <View className="h-14 w-14 items-center justify-center rounded-full bg-error-soft">
        <Ionicons name="cloud-offline-outline" size={26} color={colors.error} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-heading">{title}</Text>
      <Text className="mt-1.5 text-center text-sm leading-5 text-muted">{message}</Text>
      {onRetry ? (
        <Button
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          size="md"
          icon="refresh"
          className="mt-6"
        />
      ) : null}
    </View>
  );
}
