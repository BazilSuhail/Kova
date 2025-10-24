import { useEffect, useState } from 'react';
import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { radii, useThemeColors } from '@/config/theme';

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, radius = radii.sm, style }: Props) {
  const colors = useThemeColors();
  const [pulse] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          opacity: pulse,
          backgroundColor: colors.skeleton,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <View className="rounded-3xl border border-border bg-surface p-4">
      <Skeleton width="55%" height={14} />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={10}
          style={{ marginTop: 12 }}
        />
      ))}
    </View>
  );
}
