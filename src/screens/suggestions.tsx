import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useSuggestions } from '@/hooks/queries/insights';
import { errorMessage } from '@/lib/errors';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

const PRIORITY_BG: Record<string, string> = {
  high: 'bg-red-50 dark:bg-red-950',
  medium: 'bg-amber-50 dark:bg-amber-950',
};

const PRIORITY_TEXT: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-700 dark:text-amber-400',
};

/** Only the types the rules engine emits today; anything else falls back to a nudge. */
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

/** A read-only pill; the shared `Chip` only carries the violet selected state. */
function PriorityChip({ priority }: { priority?: string }) {
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Info';

  return (
    <View
      className={`rounded-full px-3 py-1 ${
        PRIORITY_BG[priority ?? ''] ?? 'bg-slate-100 dark:bg-slate-800'
      }`}>
      <Text
        className={`text-xs font-semibold ${
          PRIORITY_TEXT[priority ?? ''] ?? 'text-slate-600 dark:text-slate-300'
        }`}>
        {label}
      </Text>
    </View>
  );
}

export default function SuggestionsScreen() {
  const colors = useThemeColors();
  const suggestions = useSuggestions();
  const items = suggestions.data ?? [];

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/insights');
  }

  const back = (
    <Pressable
      onPress={goBack}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
      className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="chevron-back" size={18} color={colors.text} />
    </Pressable>
  );

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="mb-4">{back}</View>

      <ScreenHeader
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
            <Card key={suggestion.id} className="border-violet-200 dark:border-violet-900">
              <View className="flex-row items-start" style={{ gap: 12 }}>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                  <Ionicons name={iconForType(suggestion.type)} size={17} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Text className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {suggestion.title}
                    </Text>
                    {suggestion.priority ? <PriorityChip priority={suggestion.priority} /> : null}
                  </View>
                  {suggestion.message ? (
                    <Text className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-400">
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
