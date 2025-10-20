import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string | undefined;
  /** Helper line under the field; hidden while an error is showing. */
  hint?: string;
};

export function Input({ label, error, hint, ...rest }: Props) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  const border = error
    ? 'border-red-400 dark:border-red-500'
    : focused
      ? 'border-violet-500 dark:border-violet-400'
      : 'border-slate-200 dark:border-slate-800';

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
        className={`rounded-2xl border bg-white px-4 py-3.5 text-base text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${border}`}
      />
      {error ? (
        <Text className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</Text>
      ) : null}
    </View>
  );
}
