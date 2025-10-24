import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, padded = true, className, style }: Props) {
  const surface = `rounded-3xl border border-border bg-surface ${
    padded ? 'p-4' : ''
  } ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={`${surface} active:opacity-80`}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={surface} style={style}>
      {children}
    </View>
  );
}
