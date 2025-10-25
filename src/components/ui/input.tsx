import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useRef, useState, type ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  findNodeHandle,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { useFieldReveal } from './form-scroll';

type Props = TextInputProps & {
  label?: string;
  error?: string | undefined;
  hint?: string;
  icon?: IconName;
  /** Rendered inside the field on the right, e.g. a show-password toggle. */
  trailing?: ReactNode;
};

type FocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];
type BlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, icon, trailing, multiline, style, onFocus, onBlur, ...rest },
  ref,
) {
  const colors = useThemeColors();
  const reveal = useFieldReveal();
  const innerRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const field = error
    ? 'border-error-border bg-error-soft'
    : focused
      ? 'border-focus bg-surface'
      : 'border-border bg-surface';

  const fieldStyle: StyleProp<TextStyle> = [
    multiline ? { minHeight: 76, textAlignVertical: 'top' } : null,
    style,
  ];

  function setRefs(node: TextInput | null) {
    innerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }

  function handleFocus(event: FocusEvent) {
    setFocused(true);
    onFocus?.(event);

    const target = findNodeHandle(innerRef.current);
    if (target && reveal) {
      // Wait for the keyboard animation so the scroll offset is calculated against its final frame.
      setTimeout(() => reveal(target), 240);
    }
  }

  function handleBlur(event: BlurEvent) {
    setFocused(false);
    onBlur?.(event);
  }

  return (
    <View className={label ? 'mb-4' : ''}>
      {label ? <Text className="mb-1.5 text-sm font-medium text-heading">{label}</Text> : null}

      <View
        className={`flex-row rounded-md border px-3 ${field} ${
          multiline ? 'items-start' : 'items-center'
        }`}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={error ? colors.error : colors.muted}
            style={{ marginRight: 8, marginTop: multiline ? 15 : 0 }}
          />
        ) : null}
        <TextInput
          ref={setRefs}
          placeholderTextColor={error ? colors.errorInk : colors.muted}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
          style={fieldStyle}
          className={`flex-1 text-base text-heading ${multiline ? 'py-3' : 'py-3.5'}`}
        />
        {trailing}
      </View>

      {error ? (
        <View
          className="mt-1.5 flex-row items-start"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="alert-circle" size={13} color={colors.error} style={{ marginTop: 1 }} />
          <Text className="ml-1.5 flex-1 text-xs font-medium text-error-ink">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
});
