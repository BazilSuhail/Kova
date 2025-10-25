import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useReflections, useTodayReflection, useWriteReflection } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDueDate, parseDate, todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { layout, spacing, useThemeColors } from '@/config/theme';

type Range = 'all' | 'week' | 'month';

const RANGES: { value: Range; label: string; days: number }[] = [
  { value: 'all', label: 'All', days: Infinity },
  { value: 'week', label: 'This week', days: 7 },
  { value: 'month', label: 'This month', days: 30 },
];

function preview(text: string): string {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

function withinDays(date: string, days: number): boolean {
  const parsed = parseDate(date);
  return !parsed || Date.now() - parsed.getTime() < days * 86_400_000;
}

export default function JournalScreen() {
  const colors = useThemeColors();
  const today = useTodayReflection();
  const reflections = useReflections();
  const write = useWriteReflection();

  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('all');

  const reflection = today.data?.reflection ?? null;
  const composerOpen = editing || !reflection;
  const days = RANGES.find((option) => option.value === range)?.days ?? Infinity;
  const earlier = (reflections.data ?? []).filter((entry) => withinDays(entry.date, days));

  function startEdit() {
    setText(reflection?.text ?? '');
    setFailure(null);
    setEditing(true);
  }

  async function save() {
    const body = text.trim();
    if (!body) {
      setFailure('Write a few words first.');
      return;
    }
    setFailure(null);
    try {
      await write.mutateAsync({ text: body, prompt: today.data?.prompt, date: todayIsoDate() });
      successFeedback();
      setEditing(false);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  function earlierBody() {
    if (reflections.isPending) return <SkeletonCard lines={2} />;
    if (reflections.isError) {
      return (
        <ErrorState
          title="Could not load your journal"
          message={errorMessage(reflections.error)}
          onRetry={() => void reflections.refetch()}
        />
      );
    }
    if (earlier.length === 0) {
      return (
        <EmptyState
          icon="book-outline"
          title={range === 'all' ? 'Your journal starts today' : 'Nothing in this range'}
          description={
            range === 'all'
              ? 'Write your first reflection and it will collect here.'
              : 'Try a wider filter to see older entries.'
          }
        />
      );
    }
    return (
      <Card padded={false} className="overflow-hidden">
        {earlier.map((entry, index) => (
          <Animated.View
            key={entry.reflectionId}
            entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 40)}
          >
            <Row
              title={formatDueDate(entry.date) ?? entry.date}
              subtitle={preview(entry.text)}
              icon="book-outline"
              tone="primary"
              onPress={() =>
                router.push({
                  pathname: '/insights/journal/[id]',
                  params: { id: entry.reflectionId },
                })
              }
              last={index === earlier.length - 1}
            />
          </Animated.View>
        ))}
      </Card>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar title="Journal" left={<BackButton fallback="/insights" />} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {today.isPending ? (
          <SkeletonCard lines={3} />
        ) : today.isError ? (
          <ErrorState
            title="Could not load today's prompt"
            message={errorMessage(today.error)}
            onRetry={() => void today.refetch()}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(220)}>
            <Card>
              <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                <Ionicons name="sparkles-outline" size={16} color={colors.brandInk} />
                <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Today&apos;s question
                </Text>
              </View>
              <Text className="mt-3 text-lg font-semibold leading-6 text-heading">
                {today.data.prompt}
              </Text>
              {today.data.affirmation ? (
                <Text className="mt-2 text-sm italic text-muted">{today.data.affirmation}</Text>
              ) : null}
            </Card>

            {composerOpen ? (
              <Card className="mt-3">
                <Input
                  label="Your reflection"
                  icon="create-outline"
                  placeholder="What is on your mind?"
                  value={text}
                  onChangeText={setText}
                  multiline
                />
                <Text className="mb-3 text-xs text-muted">
                  Saving again replaces today&apos;s entry.
                </Text>
                {failure ? <FormError message={failure} /> : null}
                <View className="flex-row" style={{ gap: spacing.sm }}>
                  <View className="flex-1">
                    <Button
                      label="Save reflection"
                      icon="checkmark-circle"
                      loading={write.isPending}
                      onPress={() => void save()}
                    />
                  </View>
                  {editing ? (
                    <Button
                      label="Cancel"
                      variant="ghost"
                      disabled={write.isPending}
                      onPress={() => setEditing(false)}
                    />
                  ) : null}
                </View>
              </Card>
            ) : reflection ? (
              <Card className="mt-3">
                <Text className="text-base leading-7 text-body">{reflection.text}</Text>
                <View className="mt-4 flex-row">
                  <Button
                    label="Edit"
                    variant="secondary"
                    size="sm"
                    icon="pencil"
                    onPress={startEdit}
                  />
                </View>
              </Card>
            ) : null}
          </Animated.View>
        )}

        <SectionHeading>
          <Text className="text-base font-semibold text-heading">Earlier</Text>
        </SectionHeading>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
        >
          {RANGES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={range === option.value}
              onPress={() => {
                selectFeedback();
                setRange(option.value);
              }}
            />
          ))}
        </ScrollView>

        {earlierBody()}
      </ScrollView>
    </Screen>
  );
}
