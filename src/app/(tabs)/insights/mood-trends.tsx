import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useMoodTrends } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { parseDate } from '@/lib/format';
import { selectFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

const RANGES = [7, 30, 90];

function scoreSurface(score: number): string {
  if (score >= 4) return 'bg-brand';
  if (score === 3) return 'bg-accent';
  return 'bg-border';
}

function labelSurface(label: string): string {
  switch (label.toLowerCase()) {
    case 'great':
    case 'amazing':
    case 'good':
      return 'bg-brand';
    case 'okay':
    case 'ok':
    case 'neutral':
      return 'bg-accent';
    default:
      return 'bg-border';
  }
}

export default function MoodTrendsScreen() {
  const colors = useThemeColors();
  const [days, setDays] = useState(30);
  const trends = useMoodTrends(days);

  const buckets = Object.entries(trends.data?.distribution ?? {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...buckets.map(([, count]) => count));

  const series = trends.data?.series ?? [];
  const firstLabel =
    parseDate(series[0]?.date)?.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) ??
    '';
  const lastLabel =
    parseDate(series[series.length - 1]?.date)?.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    }) ?? '';

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader
        icon="trending-up-outline"
        eyebrow="Mood"
        title="How it has been"
        subtitle="Your check-ins over time, at a glance."
        back
        backFallback="/insights"
      />

      <View className="mt-4 flex-row" style={{ gap: 8 }}>
        {RANGES.map((range) => (
          <Chip
            key={range}
            label={`${range} days`}
            selected={days === range}
            onPress={() => {
              selectFeedback();
              setDays(range);
            }}
          />
        ))}
      </View>

      {trends.isPending ? (
        <View className="mt-5" style={{ gap: 12 }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={3} />
        </View>
      ) : trends.isError ? (
        <ErrorState
          title="Could not load your trends"
          message={errorMessage(trends.error)}
          onRetry={() => void trends.refetch()}
        />
      ) : trends.data && trends.data.entries === 0 ? (
        <EmptyState
          icon="stats-chart"
          title="No mood data yet"
          description="A few check-ins and your patterns will show up here."
          actionLabel="Log today's mood"
          onAction={() => router.push('/insights/mood')}
        />
      ) : trends.data ? (
        <>
          <View className="mt-5 flex-row" style={{ gap: 12 }}>
            <Card className="flex-1 rounded-2xl">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
                <Ionicons name="happy" size={18} color={colors.brandInk} />
              </View>
              <Text className="mt-3 text-2xl font-bold text-heading">
                {trends.data.averageScore.toFixed(1)}
              </Text>
              <Text className="text-sm text-muted">average out of 5</Text>
            </Card>

            <Card className="flex-1 rounded-2xl">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
                <Ionicons name="flame" size={18} color={colors.successInk} />
              </View>
              <Text className="mt-3 text-2xl font-bold text-heading">{trends.data.streak}</Text>
              <Text className="text-sm text-muted">day streak</Text>
            </Card>
          </View>

          {buckets.length > 0 ? (
            <>
              <SectionHeading>
                <Text className="text-base font-bold text-heading">How the days felt</Text>
              </SectionHeading>

              <Card style={{ gap: 10 }}>
                {buckets.map(([label, count]) => (
                  <View key={label} className="flex-row items-center" style={{ gap: 10 }}>
                    <Text className="w-16 text-sm font-bold capitalize text-heading">{label}</Text>
                    <View className="h-3 flex-1 overflow-hidden rounded-full bg-surface-alt">
                      <View
                        className={`h-full rounded-full ${labelSurface(label)}`}
                        style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                      />
                    </View>
                    <Text className="w-6 text-right text-sm text-muted">{count}</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {series.length > 0 ? (
            <>
              <SectionHeading>
                <Text className="text-base font-bold text-heading">Daily score</Text>
              </SectionHeading>

              <Card>
                <View className="flex-row items-end" style={{ height: 120, gap: 2 }}>
                  {series.map((point) => (
                    <View key={point.date} className="flex-1 justify-end" style={{ height: 120 }}>
                      <View
                        className={`w-full rounded-full ${
                          point.score === null ? 'bg-surface-alt' : scoreSurface(point.score)
                        }`}
                        style={{
                          height:
                            point.score === null
                              ? 4
                              : Math.max(4, Math.round((point.score / 5) * 116)),
                        }}
                      />
                    </View>
                  ))}
                </View>

                <View className="mt-2 flex-row justify-between">
                  <Text className="text-xs text-muted">{firstLabel}</Text>
                  <Text className="text-xs text-muted">{lastLabel}</Text>
                </View>
              </Card>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
