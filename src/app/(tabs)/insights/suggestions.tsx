import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { PriorityChip } from '@/components/domain/priority-chip';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { useSuggestions } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

function iconForType(type: string | undefined): IconName {
  switch (type) {
    case 'reschedule':
      return 'calendar-outline';
    case 'log_mood':
      return 'happy-outline';
    case 'focus':
      return 'flash-outline';
    case 'break':
      return 'cafe-outline';
    case 'journal':
      return 'book-outline';
    case 'celebrate':
      return 'trophy-outline';
    default:
      return 'bulb-outline';
  }
}

export default function SuggestionsScreen() {
  const colors = useThemeColors();
  const suggestions = useSuggestions();
  const items = suggestions.data ?? [];

  const back = <BackButton fallback="/insights" />;

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="mb-4">{back}</View>

      <ScreenHeader
        icon="sparkles-outline"
        eyebrow="Insights"
        title="Suggestions"
        subtitle="Derived from your tasks, mood and journal."
      />

      {suggestions.isPending ? (
        <View className="mt-5" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
        </View>
      ) : suggestions.isError ? (
        <ErrorState
          className="mt-5"
          title="Could not load your suggestions"
          message={errorMessage(suggestions.error)}
          onRetry={() => void suggestions.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon="sparkles-outline"
          title="Nothing to suggest yet"
          description="Nudges show up here once you have logged some tasks, moods or journal entries."
          actionLabel="Back to progress"
          onAction={() => router.replace('/insights')}
        />
      ) : (
        <View className="mt-5" style={{ gap: 8 }}>
          {items.map((suggestion) => (
            <Card key={suggestion.id} className="border-border">
              <View className="flex-row items-start" style={{ gap: 12 }}>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
                  <Ionicons name={iconForType(suggestion.type)} size={17} color={colors.brandInk} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Text className="flex-1 text-sm font-bold text-heading">
                      {suggestion.title}
                    </Text>
                    {suggestion.priority ? <PriorityChip priority={suggestion.priority} /> : null}
                  </View>
                  {suggestion.message ? (
                    <Text className="mt-1.5 text-sm leading-5 text-muted">
                      {suggestion.message}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
