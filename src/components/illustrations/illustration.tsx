import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Focus from '@/assets/illustrations/focus.svg';
import Insights from '@/assets/illustrations/insights.svg';
import Mood from '@/assets/illustrations/mood.svg';
import Plan from '@/assets/illustrations/plan.svg';
import VoiceScan from '@/assets/illustrations/voice-scan.svg';
import WelcomeHero from '@/assets/illustrations/welcome-hero.svg';
import { useThemeColors } from '@/config/theme';

const ART = {
  'welcome-hero': WelcomeHero,
  plan: Plan,
  focus: Focus,
  'voice-scan': VoiceScan,
  mood: Mood,
  insights: Insights,
} as const;

export type IllustrationName = keyof typeof ART;

type Props = {
  name: IllustrationName;
  /** Rendered height; width follows the 4:3 artwork. */
  height?: number;
  /** Scale in (and keep gently floating) while true. */
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

const EASE = Easing.inOut(Easing.sin);

/** Decorative flat artwork from assets/illustrations. Tints its neutral parts with the heading color. */
export function Illustration({ name, height = 180, active = true, style }: Props) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(reducedMotion ? 1 : 0.9);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || !active) {
      return;
    }
    scale.value = 0.9;
    scale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    lift.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: EASE }),
        withTiming(0, { duration: 1800, easing: EASE }),
      ),
      -1,
    );
    return () => cancelAnimation(lift);
  }, [active, reducedMotion, scale, lift]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: scale.value }],
  }));

  const Art = ART[name];

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height, aspectRatio: 4 / 3, alignSelf: 'center' }, animated, style]}
    >
      <Art width="100%" height="100%" color={colors.heading} />
    </Animated.View>
  );
}
