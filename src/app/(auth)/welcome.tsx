import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { IntroPager } from '@/components/auth/intro-pager';
import { Illustration, type IllustrationName } from '@/components/illustrations/illustration';
import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { FloatingShapes } from '@/components/ui/floating-shapes';
import { FormError } from '@/components/ui/form-error';
import { Icon } from '@/components/ui/icon';
import { ThemedSafeAreaView } from '@/components/ui/styled';
import { layout, spacing, useThemeColors } from '@/config/theme';
import { useAuth } from '@/providers/auth-provider';
import { retrySession } from '@/store/auth-store';
import type { IconName } from '@/theme/icons';

type Step = {
  art: IllustrationName;
  title: string;
  detail: string;
  bullets: { icon: IconName; label: string }[];
};

const STEPS: Step[] = [
  {
    art: 'welcome-hero',
    title: 'Your calm day, in one place',
    detail: 'Capture what matters and keep the next step in view.',
    bullets: [
      { icon: 'checkmark-done-outline', label: 'Tasks, plans and moods together' },
      { icon: 'shield-checkmark-outline', label: 'Private by default' },
    ],
  },
  {
    art: 'plan',
    title: 'Plan a realistic day',
    detail: 'Pick a few focus tasks, not fifty.',
    bullets: [
      { icon: 'calendar-outline', label: 'Today and upcoming at a glance' },
      { icon: 'alarm-outline', label: 'Reminders right when they are due' },
    ],
  },
  {
    art: 'voice-scan',
    title: 'Capture in seconds',
    detail: 'Type it, say it, or snap a photo of a list.',
    bullets: [
      { icon: 'mic-outline', label: 'Speak a task, Kova writes it down' },
      { icon: 'scan-outline', label: 'Turn notes and photos into tasks' },
    ],
  },
  {
    art: 'mood',
    title: 'See how it feels',
    detail: 'Check in on your mood and watch progress add up.',
    bullets: [
      { icon: 'happy-outline', label: 'Quick mood check-ins' },
      { icon: 'stats-chart-outline', label: 'Recaps and trends over time' },
    ],
  },
];

const LAST = STEPS.length - 1;
const GUTTER = layout.gutter + spacing.sm;

function Dot({ active }: { active: boolean }) {
  const colors = useThemeColors();
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 8, { duration: 220 }),
    opacity: withTiming(active ? 1 : 0.3, { duration: 220 }),
  }));

  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4, backgroundColor: colors.brandInk }, style]}
    />
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { restoreError } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [page, setPage] = useState(0);
  const { height } = useWindowDimensions();
  const artHeight = height <= 640 ? 120 : height < 760 ? 160 : 210;
  const isLast = page === LAST;

  async function handleRetry() {
    setRetrying(true);
    try {
      await retrySession();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <ThemedSafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} className="bg-background">
      <FloatingShapes />

      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: GUTTER, height: 56 }}
      >
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <BrandMark size={28} style={{ borderRadius: 6 }} />
          <Text className="text-lg font-bold tracking-tight text-heading">Kova</Text>
        </View>
        {isLast ? null : (
          <Pressable
            onPress={() => setPage(LAST)}
            accessibilityRole="button"
            accessibilityLabel="Skip intro"
            hitSlop={8}
            className="flex-row items-center rounded-md px-2 py-1.5 active:opacity-70"
            style={{ gap: 2 }}
          >
            <Text className="text-sm font-semibold text-muted">Skip</Text>
            <Icon name="chevron-forward" size={14} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <IntroPager page={page} onPageChange={setPage}>
        {STEPS.map((step, index) => (
          // Each step scrolls on short screens / large font scale; the CTAs below stay fixed.
          <ScrollView
            key={step.art}
            collapsable={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: GUTTER,
              paddingVertical: spacing.lg,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Illustration name={step.art} height={artHeight} active={index === page} />
            <Text className="mt-6 text-3xl font-bold tracking-tight text-heading">
              {step.title}
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">{step.detail}</Text>
            <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
              {step.bullets.map((bullet) => (
                <View
                  key={bullet.label}
                  className="flex-row items-center"
                  style={{ gap: spacing.md }}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-md bg-brand-soft">
                    <Icon name={bullet.icon} size={18} tone="brand" />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-body">{bullet.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ))}
      </IntroPager>

      <View style={{ paddingHorizontal: GUTTER, paddingTop: spacing.lg, gap: spacing.sm }}>
        <View
          className="flex-row items-center justify-center"
          style={{ gap: spacing.sm, marginBottom: spacing.md }}
        >
          {STEPS.map((step, index) => (
            <Pressable
              key={step.art}
              onPress={() => setPage(index)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Go to step ${index + 1} of ${STEPS.length}`}
              accessibilityState={{ selected: index === page }}
            >
              <Dot active={index === page} />
            </Pressable>
          ))}
        </View>

        {restoreError ? (
          <View>
            <FormError message={restoreError} tone="warning" />
            <Button
              label="Try again"
              icon="refresh"
              variant="secondary"
              loading={retrying}
              onPress={() => void handleRetry()}
            />
          </View>
        ) : null}

        {isLast ? (
          <Animated.View entering={FadeInDown.duration(220)} style={{ gap: spacing.sm }}>
            <Button
              label="Create account"
              icon="person-add-outline"
              onPress={() => router.push('/signup')}
            />
            <Button
              label="I have an account"
              icon="log-in-outline"
              variant="ghost"
              onPress={() => router.push('/login')}
            />
          </Animated.View>
        ) : (
          <Button label="Next" icon="arrow-forward" onPress={() => setPage(page + 1)} />
        )}
      </View>
    </ThemedSafeAreaView>
  );
}
