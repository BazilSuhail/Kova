import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type Props = {
  message: string;
  tone?: 'error' | 'warning';
};

/** Inline banner for form-level failures (wrong credentials, server down, rate limited). */
export function FormError({ message, tone = 'error' }: Props) {
  const isWarning = tone === 'warning';
  const icon = isWarning ? 'cloud-offline' : 'alert-circle';

  return (
    <View
      className={`mb-4 flex-row items-start rounded-2xl border p-3 ${
        isWarning
          ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
          : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
      }`}>
      <Ionicons name={icon} size={18} color={isWarning ? '#D97706' : '#DC2626'} />
      <Text
        className={`ml-2 flex-1 text-sm font-medium ${
          isWarning ? 'text-amber-800 dark:text-amber-200' : 'text-red-700 dark:text-red-300'
        }`}>
        {message}
      </Text>
    </View>
  );
}
