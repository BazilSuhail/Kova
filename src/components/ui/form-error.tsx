import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/config/theme';

type Props = {
  message: string;
  tone?: 'error' | 'warning';
};

export function FormError({ message, tone = 'error' }: Props) {
  const colors = useThemeColors();
  const isWarning = tone === 'warning';

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`mb-4 flex-row items-start rounded-lg border p-3.5 ${
        isWarning ? 'border-warning bg-warning' : 'border-error-border bg-error-soft'
      }`}
    >
      <Ionicons
        name={isWarning ? 'cloud-offline' : 'alert-circle'}
        size={18}
        color={isWarning ? colors.onWarningFill : colors.error}
        style={{ marginTop: 1 }}
      />
      <Text
        className={`ml-2.5 flex-1 text-sm font-medium ${
          isWarning ? 'text-on-warning' : 'text-error-ink'
        }`}
      >
        {message}
      </Text>
    </View>
  );
}
