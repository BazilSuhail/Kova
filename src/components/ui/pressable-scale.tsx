import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tapFeedback } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Light haptic tick on press. Use for primary actions. */
  haptic?: boolean;
  /** Pressed scale. DESIGN.md default is 0.97. */
  scaleTo?: number;
};

/** Pressable that shrinks slightly while held. Base for every tappable primitive. */
export function PressableScale({
  haptic = false,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 140 });
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic) tapFeedback();
        onPress?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
