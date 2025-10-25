import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { useMoodTrends } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { parseDate } from '@/lib/format';
import { selectFeedback } from '@/lib/haptics';
import { chartColors, layout, spacing, useThemeColors } from '@/config/theme';

const RANGES = [7, 30, 90];

function moodColor(label: string): string {
  switch (label.toLowerCase()) {
    case 'great':
    case 'amazing':
      return chartColors[0];
    case 'good':
      return chartColors[1];
    case 'okay':
    case 'ok':
    case 'neutral':
      return chartColors[2];
    case 'low':
      return chartColors[3];
    default:
      return chartColors[4];
  }
}

function shortDay(date: string): string {
  return parseDate(date)?.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) ?? '';
}

export default function MoodTrendsScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const [days, setDays] = useState(30);
  const trends = useMoodTrends(days);

  const buckets = Object.entries(trends.data?.distribution ?? {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...buckets.map(([, count]) => count));

  const points = (trends.data?.series ?? []).filter((point) => point.score !== null);
  // Label only first, middle and last points so the axis never crowds.
  const labelAt = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);
  const lineData = points.map((point, index) => ({
    value: point.score ?? 0,
    label: labelAt.has(index) ? shortDay(point.date) : '',
    labelTextStyle: { color: colors.muted, fontSize: 10, width: 48 },
  }));
  const chartWidth = width - layout.gutter * 2 - spacing.lg * 2;

  function body() {
    if (trends.isPending) {
      return (
        <View style={{ gap: spacing.md }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={4} />
        </View>
      );
    }
    if (trends.isError) {
      return (
        <ErrorState
          title="Could not load your trends"
          message={errorMessage(trends.error)}
          onRetry={() => void trends.refetch()}
        />
      );
    }
    if (trends.data.entries === 0) {
      return (
        <EmptyState
          icon="stats-chart"
          title="No mood data yet"
          description="A few check-ins and your patterns will show up here."
          actionLabel="Log today's mood"
          onAction={() => router.push('/insights/mood')}
        />
      );
    }

    return (
      <>
        <Animated.View
          entering={FadeInDown.duration(220)}
          className="flex-row"
          style={{ gap: spacing.md }}
        >
          <StatTile icon="happy-outline" value={trends.data.averageScore.toFixed(1)} label="Average of 5" />
          <StatTile icon="flame-outline" value={trends.data.streak} label="Day streak" />
          <StatTile icon="checkmark-done" value={trends.data.entries} label="Check-ins" />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(220).delay(40)}>
          <SectionHeading>
            <Text className="text-base font-semibold text-heading">Daily score</Text>
          </SectionHeading>
          <Card>
            {lineData.length > 1 ? (
              <LineChart
                data={lineData}
                areaChart
                curved
                isAnimated
                adjustToWidth
                parentWidth={chartWidth}
                width={chartWidth - 28}
                height={160}
                maxValue={5}
                noOfSections={5}
                color={chartColors[0]}
                thickness={2}
                startFillColor={chartColors[0]}
                endFillColor={chartColors[0]}
                startOpacity={0.28}
                endOpacity={0.02}
                hideDataPoints={lineData.length > 31}
                dataPointsColor={chartColors[0]}
                dataPointsRadius={3}
                initialSpacing={8}
                endSpacing={16}
                yAxisLabelWidth={24}
                yAxisThickness={0}
                xAxisColor={colors.border}
                rulesColor={colors.border}
                rulesType="solid"
                yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
                disableScroll
              />
            ) : (
              <Text className="text-sm text-muted">
                Check in on a second day to see the line take shape.
              </Text>
            )}
            <Text className="mt-2 text-xs text-muted">Score 1 (awful) to 5 (great), per day</Text>
          </Card>
        </Animated.View>

        {buckets.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(220).delay(80)}>
            <SectionHeading>
              <Text className="text-base font-semibold text-heading">How the days felt</Text>
            </SectionHeading>
            <Card style={{ gap: spacing.md }}>
              {buckets.map(([label, count]) => (
                <View key={label} className="flex-row items-center" style={{ gap: spacing.md }}>
                  <Text className="w-16 text-sm font-medium capitalize text-heading">{label}</Text>
                  <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-alt">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((count / maxCount) * 100)}%`,
                        backgroundColor: moodColor(label),
                      }}
                    />
                  </View>
                  <Text className="w-6 text-right text-sm text-muted">{count}</Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        ) : null}
      </>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Mood trends"
        left={<BackButton fallback="/insights" />}
        actions={[
          {
            icon: 'time-outline',
            accessibilityLabel: 'Mood history',
            onPress: () => router.push('/insights/mood-history'),
          },
        ]}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row" style={{ gap: spacing.sm }}>
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
        {body()}
      </ScrollView>
    </Screen>
  );
}
