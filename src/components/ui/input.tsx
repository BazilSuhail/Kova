import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Props = TextInputProps & {
  label?: string;
  error?: string | undefined;
  hint?: string;
  icon?: IconName;
};

export function Input({ label, error, hint, icon, multiline, style, ...rest }: Props) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  const border = error ? 'border-danger' : focused ? 'border-focus' : 'border-border';

  const fieldStyle: StyleProp<TextStyle> = [
    multiline ? { minHeight: 76, textAlignVertical: 'top' } : null,
    style,
  ];

  return (
    <View className={label ? 'mb-4' : ''}>
      {label ? <Text className="mb-2 text-sm font-semibold text-heading">{label}</Text> : null}

      <View
        className={`flex-row rounded-2xl border bg-surface px-4 ${border} ${
          multiline ? 'items-start' : 'items-center'
        }`}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={colors.muted}
            style={{ marginRight: 8, marginTop: multiline ? 15 : 0 }}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.muted}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
          style={fieldStyle}
          className={`flex-1 text-base text-heading ${multiline ? 'py-3' : 'py-3.5'}`}
        />
      </View>

      {error ? (
        <Text className="mt-1.5 text-xs font-medium text-danger-ink">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
