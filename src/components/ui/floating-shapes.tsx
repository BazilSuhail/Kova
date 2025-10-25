import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/config/theme';

type ShapeKind = 'circle' | 'square' | 'ring';

type ShapeSpec = {
  kind: ShapeKind;
  size: number;
  top: DimensionValue;
  left: DimensionValue;
  tint: 'brand' | 'accent';
  opacity: number;
  drift: number;
  duration: number;
  delay: number;
};

const SHAPES: ShapeSpec[] = [
  { kind: 'circle', size: 180, top: '-8%', left: '-12%', tint: 'accent', opacity: 0.1, drift: 18, duration: 9000, delay: 0 },
  { kind: 'ring', size: 120, top: '6%', left: '68%', tint: 'brand', opacity: 0.1, drift: 14, duration: 11000, delay: 600 },
  { kind: 'square', size: 64, top: '42%', left: '80%', tint: 'accent', opacity: 0.12, drift: 22, duration: 10000, delay: 1200 },
  { kind: 'circle', size: 90, top: '58%', left: '6%', tint: 'brand', opacity: 0.06, drift: 16, duration: 12000, delay: 300 },
  { kind: 'square', size: 44, top: '22%', left: '34%', tint: 'brand', opacity: 0.08, drift: 12, duration: 8000, delay: 900 },
  { kind: 'ring', size: 70, top: '78%', left: '58%', tint: 'accent', opacity: 0.1, drift: 18, duration: 13000, delay: 1500 },
];

function Shape({ spec, color, still }: { spec: ShapeSpec; color: string; still: boolean }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    t.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(t);
  }, [still, spec.delay, spec.duration, t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: (t.value - 0.5) * spec.drift },
      { translateY: (0.5 - t.value) * spec.drift * 1.4 },
      { rotate: spec.kind === 'square' ? `${t.value * 24 - 12}deg` : '0deg' },
    ],
  }));

  const shapeStyle: ViewStyle = {
    position: 'absolute',
    top: spec.top,
    left: spec.left,
    width: spec.size,
    height: spec.size,
    opacity: spec.opacity,
    borderRadius: spec.kind === 'square' ? spec.size * 0.22 : spec.size / 2,
    ...(spec.kind === 'ring'
      ? { borderWidth: Math.max(6, spec.size * 0.1), borderColor: color }
      : { backgroundColor: color }),
  };

  return <Animated.View style={[shapeStyle, style]} />;
}

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Slow drifting decorative blobs. Place as the first child of a relatively positioned container. */
export function FloatingShapes({ style }: Props) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      {SHAPES.map((spec, index) => (
        <Shape
          key={index}
          spec={spec}
          color={spec.tint === 'brand' ? colors.brand : colors.accent}
          still={reducedMotion}
        />
      ))}
    </View>
  );
}
