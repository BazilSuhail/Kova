import type { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({ children, action, className }: Props) {
  return (
    <View className={`mb-3 mt-6 flex-row items-center justify-between ${className ?? ''}`}>
      {children}
      {action}
    </View>
  );
}
