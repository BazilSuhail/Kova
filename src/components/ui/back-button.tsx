import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/config/theme';

type Props = {
  fallback?: Href;
  className?: string;
};

export function BackButton({ fallback = '/', className }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
      className={`h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70 ${className ?? ''}`}
    >
      <Ionicons name="chevron-back" size={18} color={colors.heading} />
    </Pressable>
  );
}
