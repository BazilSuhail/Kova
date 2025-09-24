import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function CurvyBackground({ theme = 'light' }) {
  const bgColor = theme === 'dark' ? '#030712' : '#fff';
  const lineColor = theme === 'dark' ? '#10B981' : '#059669';
  const secondaryLineColor = theme === 'dark' ? '#047857' : '#34D399';

  const offset = useSharedValue(0);

  useEffect(() => {
    // Create a continuous animation that resets smoothly
    offset.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 4000, easing: Easing.linear })
      ),
      -1,
      false
    );
  }, []);

  const animatedPropsTop = useAnimatedProps(() => {
    // Use the offset directly, but wrap around when it exceeds width
    const currentOffset = offset.value % width;
    return {
      d: `
        M0,50
        Q${width / 2 + currentOffset},100 ${width},50
      `
    };
  });

  const animatedPropsMiddle = useAnimatedProps(() => {
    const currentOffset = offset.value % width;
    return {
      d: `
        M0,200
        C${width / 4 + currentOffset},250 ${3 * width / 4 + currentOffset},150 ${width},200
      `
    };
  });

  const animatedPropsBottom = useAnimatedProps(() => {
    const currentOffset = offset.value % width;
    return {
      d: `
        M0,350
        Q${width / 2 + currentOffset},300 ${width},350
      `
    };
  });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width, height, backgroundColor: bgColor }}>
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <AnimatedPath
          animatedProps={animatedPropsTop}
          stroke={lineColor}
          strokeWidth={2}
          fill="none"
        />
        <AnimatedPath
          animatedProps={animatedPropsMiddle}
          stroke={secondaryLineColor}
          strokeWidth={2}
          fill="none"
        />
        <AnimatedPath
          animatedProps={animatedPropsBottom}
          stroke={lineColor}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
}