import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { spacing } from '@/config/theme';
import { ThemedSafeAreaView } from './styled';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentContainerStyle,
  style,
  className,
}: Props) {
  return (
    <ThemedSafeAreaView
      style={{ flex: 1 }}
      edges={edges}
      className={`bg-background ${className ?? ''}`}
    >
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            {
              paddingHorizontal: spacing.xxl,
              paddingTop: spacing.xl,
              paddingBottom: spacing.xxxl,
            },
            contentContainerStyle,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentContainerStyle, style]}>{children}</View>
      )}
    </ThemedSafeAreaView>
  );
}
