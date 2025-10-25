import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from './pressable-scale';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, padded = true, className, style }: Props) {
  const surface = `rounded-lg border border-border bg-surface ${padded ? 'p-4' : ''} ${
    className ?? ''
  }`;

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        className={surface}
        style={style}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <View className={surface} style={style}>
      {children}
    </View>
  );
}
