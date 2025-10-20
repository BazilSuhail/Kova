import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
};

/** Shared frame for the auth screens: optional back, mark, heading, form, pinned footer. */
export function AuthScaffold({ title, subtitle, children, footer, onBack }: Props) {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-100 dark:bg-slate-950" edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="-ml-2 mb-4 h-10 w-10 items-center justify-center rounded-full active:opacity-70">
              <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
            </Pressable>
          ) : null}

          <View className="mb-7 h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
            <Ionicons name="sparkles" size={26} color="#FFFFFF" />
          </View>

          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</Text>
          {subtitle ? (
            <Text className="mt-2 text-base text-slate-500 dark:text-slate-400">{subtitle}</Text>
          ) : null}

          <View className="mt-8">{children}</View>

          <View style={{ flex: 1 }} />

          {footer ? <View className="mt-8">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
