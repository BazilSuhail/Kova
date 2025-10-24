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
    <View className={`items-center px-6 py-10 ${className ?? ''}`}>
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-danger">
        <Ionicons name="cloud-offline" size={28} color={colors.onDangerFill} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-heading">{title}</Text>
      <Text className="mt-1.5 text-center text-sm text-muted">{message}</Text>
      {onRetry ? (
        <View className="mt-5 w-full">
          <Button
            label="Try again"
            onPress={onRetry}
            variant="secondary"
            size="md"
            icon="refresh"
          />
        </View>
      ) : null}
    </View>
  );
}
