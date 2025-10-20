import type { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
  /** Optional trailing element, e.g. a "See all" pressable. */
  action?: ReactNode;
  /** Extra top spacing; defaults to sitting above a list. */
  className?: string;
};

/** Small heading that introduces a group of cards or rows. */
export function SectionHeading({ children, action, className }: Props) {
  return (
    <View className={`mb-3 mt-6 flex-row items-center justify-between ${className ?? ''}`}>
      {children}
      {action}
    </View>
  );
}
