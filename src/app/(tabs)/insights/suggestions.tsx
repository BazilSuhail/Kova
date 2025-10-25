import { router, type Href } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PriorityChip } from '@/components/domain/priority-chip';
import { AppBar } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useSuggestions } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const TYPES: Record<string, { icon: IconName; href?: Href }> = {
  reschedule: { icon: 'calendar-outline', href: '/tasks' },
  log_mood: { icon: 'happy-outline', href: '/insights/mood' },
  focus: { icon: 'flash-outline', href: '/tasks' },
  break: { icon: 'cafe-outline' },
  journal: { icon: 'book-outline', href: '/insights/journal' },
  celebrate: { icon: 'trophy-outline' },
};

export default function SuggestionsScreen() {
  const colors = useThemeColors();
  const suggestions = useSuggestions();
  const items = suggestions.data ?? [];

  function body() {
    if (suggestions.isPending) {
      return (
        <View style={{ gap: spacing.md }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      );
    }
    if (suggestions.isError) {
      return (
        <ErrorState
          title="Could not load your suggestions"
          message={errorMessage(suggestions.error)}
          onRetry={() => void suggestions.refetch()}
        />
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon="sparkles-outline"
          title="Nothing to suggest yet"
          description="Nudges show up here once you have logged some tasks, moods or journal entries."
          actionLabel="Log today's mood"
          onAction={() => router.push('/insights/mood')}
        />
      );
    }
    return (
      <Card padded={false} className="overflow-hidden">
        {items.map((suggestion, index) => {
          const type = TYPES[suggestion.type ?? ''];
          const href = type?.href;
          return (
            <Animated.View
              key={suggestion.id}
              entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 40)}
            >
              <Row
                icon={type?.icon ?? 'bulb-outline'}
                tone="primary"
                title={suggestion.title}
                subtitle={suggestion.message}
                right={
                  suggestion.priority ? <PriorityChip priority={suggestion.priority} /> : undefined
                }
                onPress={href ? () => router.push(href) : undefined}
                last={index === items.length - 1}
              />
            </Animated.View>
          );
        })}
      </Card>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar title="Suggestions" left={<BackButton fallback="/insights" />} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={suggestions.isRefetching}
            onRefresh={() => void suggestions.refetch()}
            tintColor={colors.brandInk}
            colors={[colors.brandInk]}
          />
        }
      >
        {body()}
      </ScrollView>
    </Screen>
  );
}
