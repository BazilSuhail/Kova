import type { ReactNode } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  children: ReactNode[];
};

/** Web fallback: one step at a time, driven by the Next / Skip buttons and the page dots. */
export function IntroPager({ page, children }: Props) {
  return (
    <Animated.View key={page} entering={FadeIn.duration(220)} style={{ flex: 1 }}>
      {children[page]}
    </Animated.View>
  );
}
