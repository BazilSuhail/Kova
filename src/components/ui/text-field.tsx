import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string | undefined;
};

export function TextField({ label, error, ...rest }: Props) {
  const colors = useThemeColors();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...rest}
        className={`rounded-2xl border bg-white px-4 py-3.5 text-base text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${
          error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-800'
        }`}
      />
      {error ? (
        <Text className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
