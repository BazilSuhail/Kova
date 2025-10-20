import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/theme/colors';

type Props = {
  /** Where to land when there is nothing to pop, e.g. after a cold deep link. */
  fallback?: Href;
  className?: string;
};

/**
 * Header back control for the pushed screens in a tab's stack.
 *
 * The stacks hide their native headers, so each pushed screen places this itself. A cold deep
 * link has no history to pop, which is what the `fallback` covers.
 */
export function BackButton({ fallback = '/', className }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
      className={`h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900 ${className ?? ''}`}>
      <Ionicons name="chevron-back" size={18} color={colors.text} />
    </Pressable>
  );
}
