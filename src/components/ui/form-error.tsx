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
  const icon = isWarning ? 'cloud-offline' : 'alert-circle';

  return (
    <View
      className={`mb-4 flex-row items-start rounded-2xl border p-3 ${
        isWarning ? 'border-warning bg-warning' : 'border-danger bg-danger'
      }`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={isWarning ? colors.onWarningFill : colors.onDangerFill}
      />
      <Text
        className={`ml-2 flex-1 text-sm font-medium ${
          isWarning ? 'text-on-warning' : 'text-on-danger'
        }`}
      >
        {message}
      </Text>
    </View>
  );
}
