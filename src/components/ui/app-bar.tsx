import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { BrandMark } from './brand-mark';

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /** Small dot in the top-right corner (e.g. unread notifications). */
  badge?: boolean;
  size?: number;
  color?: string;
  className?: string;
};

/** 40x40 round touch target with a single icon. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  badge = false,
  size = 22,
  color,
  className,
}: IconButtonProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`h-10 w-10 items-center justify-center rounded-full active:bg-surface-alt ${className ?? ''}`}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.heading} />
      {badge ? (
        <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-error" />
      ) : null}
    </Pressable>
  );
}

export type AppBarAction = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  badge?: boolean;
};

type Props = {
  /** Defaults to "Kova". */
  title?: string;
  /** Show the brand mark before the title. Defaults to true. */
  brand?: boolean;
  /** Replaces the brand mark, e.g. a <BackButton />. */
  left?: ReactNode;
  actions?: AppBarAction[];
  /** Extra trailing content after the actions, e.g. an avatar. */
  right?: ReactNode;
};

/** YouTube-style top bar: brand + title left, icon buttons right. Place above scroll content. */
export function AppBar({ title = 'Kova', brand = true, left, actions, right }: Props) {
  return (
    <View className="h-14 flex-row items-center bg-background pl-4 pr-2">
      <View className="flex-1 flex-row items-center" style={{ gap: spacing.sm }}>
        {left ?? (brand ? <BrandMark size={28} style={{ borderRadius: 6 }} /> : null)}
        <Text numberOfLines={1} className="flex-shrink text-xl font-bold tracking-tight text-heading">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center">
        {actions?.map((action) => <IconButton key={action.accessibilityLabel} {...action} />)}
        {right}
      </View>
    </View>
  );
}
