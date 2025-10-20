import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  /** Makes the whole card tappable. */
  onPress?: () => void;
  /** Remove the default padding (for cards that hold their own rows or media). */
  padded?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** The standard surface: rounded, hairline border, light/dark aware. */
export function Card({ children, onPress, padded = true, className, style }: Props) {
  const surface = `rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
    padded ? 'p-4' : ''
  } ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" className={`${surface} active:opacity-80`} style={style}>
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
