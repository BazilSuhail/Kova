import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackButton } from '@/components/ui/back-button';
import { Illustration, type IllustrationName } from '@/components/illustrations/illustration';
import { BrandMark } from '@/components/ui/brand-mark';
import { FloatingShapes } from '@/components/ui/floating-shapes';
import { FormScrollView } from '@/components/ui/form-scroll';
import { ThemedSafeAreaView } from '@/components/ui/styled';
import { layout, spacing } from '@/config/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  /** Small artwork shown above the title instead of the brand mark. */
  illustration?: IllustrationName;
};

/** Shared frame for welcome-adjacent screens: drifting shapes behind the brand header, form below. */
export function AuthScaffold({ title, subtitle, children, footer, onBack, illustration }: Props) {
  const compact = useWindowDimensions().height <= 640;
  return (
    <ThemedSafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} className="bg-background">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FormScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.lg }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          <View
            className="relative overflow-hidden"
            style={{ paddingHorizontal: layout.gutter + spacing.sm, paddingBottom: spacing.xxl }}
          >
            <FloatingShapes />
            <View style={{ height: 48, justifyContent: 'center' }} className="-ml-2">
              {onBack ? <BackButton onPress={onBack} /> : null}
            </View>
            <Animated.View entering={FadeInDown.duration(260)} className={compact ? 'mt-1' : 'mt-4'}>
              {illustration ? (
                <Illustration name={illustration} height={compact ? 88 : 120} style={{ alignSelf: 'flex-start' }} />
              ) : (
                <BrandMark size={44} style={{ borderRadius: 10 }} />
              )}
              <Text className="mt-5 text-3xl font-bold tracking-tight text-heading">{title}</Text>
              {subtitle ? <Text className="mt-2 text-base leading-6 text-muted">{subtitle}</Text> : null}
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInDown.duration(260).delay(60)}
            style={{ flexGrow: 1, paddingHorizontal: layout.gutter + spacing.sm }}
          >
            {children}
          </Animated.View>

          {footer ? (
            <View className="mt-6" style={{ paddingHorizontal: layout.gutter + spacing.sm }}>
              {footer}
            </View>
          ) : null}
        </FormScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
