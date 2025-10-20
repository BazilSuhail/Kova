import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle } from 'react-native';

import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type Props = TextInputProps & {
  /** Omit for a bare field, e.g. a search bar. */
  label?: string;
  error?: string | undefined;
  /** Helper line under the field; hidden while an error is showing. */
  hint?: string;
  /** Leading icon, for search fields and the like. */
  icon?: IconName;
};

export function Input({ label, error, hint, icon, multiline, style, ...rest }: Props) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  const border = error
    ? 'border-red-400 dark:border-red-500'
    : focused
      ? 'border-violet-500 dark:border-violet-400'
      : 'border-slate-200 dark:border-slate-800';

  // A multiline field needs its own height and top alignment, otherwise it centres oddly.
  const fieldStyle: StyleProp<TextStyle> = [
    multiline ? { minHeight: 76, textAlignVertical: 'top' } : null,
    style,
  ];

  return (
    <View className={label ? 'mb-4' : ''}>
      {label ? (
        <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      ) : null}

      <View
        className={`flex-row rounded-2xl border bg-white px-4 dark:bg-slate-900 ${border} ${
          multiline ? 'items-start' : 'items-center'
        }`}>
        {icon ? (
          <Ionicons name={icon} size={17} color={colors.textMuted} style={{ marginRight: 8, marginTop: multiline ? 15 : 0 }} />
        ) : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
          style={fieldStyle}
          className={`flex-1 text-base text-slate-900 dark:text-slate-100 ${multiline ? 'py-3' : 'py-3.5'}`}
        />
      </View>

      {error ? (
        <Text className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</Text>
      ) : null}
    </View>
  );
}
