import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { ThemedSafeAreaView } from './styled';

type Props = {
  children: ReactNode;
  /** Wrap the body in a ScrollView. Set `false` for screens that own their own list. */
  scroll?: boolean;
  /** Safe-area edges to respect. Defaults to the top only; the tab bar owns the bottom. */
  edges?: Edge[];
  /** Extra padding for the scroll content, merged over the defaults. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Applied to the scroll content or the plain body view. */
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/** Standard screen frame: themed background, safe area, and consistent gutters. */
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
      className={`bg-slate-100 dark:bg-slate-950 ${className ?? ''}`}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
            contentContainerStyle,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentContainerStyle, style]}>{children}</View>
      )}
    </ThemedSafeAreaView>
  );
}
