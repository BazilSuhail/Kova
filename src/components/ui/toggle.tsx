import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Toggle({
  value,
  onChange,
  label,
  hint,
  disabled = false,
  accessibilityLabel,
  className,
  style,
}: Props) {
  const knobs = (
    <View
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${value ? 'bg-brand' : 'bg-border'}`}
    >
      <View
        className={`h-6 w-6 rounded-full ${value ? 'bg-on-brand' : 'bg-surface'}`}
        style={{ transform: [{ translateX: value ? 20 : 0 }] }}
      />
    </View>
  );

  if (!label) {
    return (
      <Pressable
        onPress={() => onChange(!value)}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={accessibilityLabel}
        className={`${disabled ? 'opacity-60' : 'active:opacity-80'} ${className ?? ''}`}
        style={style}
      >
        {knobs}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`flex-row items-center justify-between ${disabled ? 'opacity-60' : 'active:opacity-80'} ${
        className ?? ''
      }`}
      style={style}
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm font-semibold text-heading">{label}</Text>
        {hint ? <Text className="mt-0.5 text-xs text-muted">{hint}</Text> : null}
      </View>
      {knobs}
    </Pressable>
  );
}
