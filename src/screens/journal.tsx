import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useReflections, useTodayReflection, useWriteReflection } from '@/hooks/queries/insights';
import { errorMessage } from '@/lib/errors';
import { formatDueDate, todayIsoDate } from '@/lib/format';
import { successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

/** One flattened line of a reflection, short enough for a list row. */
function preview(text: string): string {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

export default function JournalScreen() {
  const colors = useThemeColors();
  const today = useTodayReflection();
  const reflections = useReflections();
  const write = useWriteReflection();

  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const reflection = today.data?.reflection ?? null;
  const composerOpen = editing || !reflection;
  const earlier = reflections.data ?? [];

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
      // The date keeps the write tied to today, and the server replaces any existing entry.
      await write.mutateAsync({ text: body, prompt: today.data?.prompt, date: todayIsoDate() });
      successFeedback();
      setEditing(false);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader
        eyebrow="Journal"
        title="Reflect"
        subtitle="A minute with yourself, once a day."
        back
        backFallback="/insights"
      />

      {today.isPending ? (
        <View className="mt-5">
          <SkeletonCard lines={3} />
        </View>
      ) : today.isError ? (
        <ErrorState
          title="Could not load today's prompt"
          message={errorMessage(today.error)}
          onRetry={() => void today.refetch()}
        />
      ) : today.data ? (
        <>
          <Card className="mt-5 border-violet-200 dark:border-violet-900">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Today&apos;s question
              </Text>
            </View>
            <Text className="mt-3 text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
              {today.data.prompt}
            </Text>
            <Text className="mt-2 text-sm italic text-slate-500 dark:text-slate-400">
              {today.data.affirmation}
            </Text>
          </Card>

          {composerOpen ? (
            <Card className="mt-3">
              <Input
                label="Your reflection"
                placeholder="What is on your mind?"
                value={text}
                onChangeText={setText}
                multiline
              />
              <Text className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Saving again replaces today&apos;s entry.
              </Text>
              {failure ? <FormError message={failure} /> : null}
              <Button
                label="Save reflection"
                icon="checkmark-circle"
                loading={write.isPending}
                onPress={() => void save()}
              />
            </Card>
          ) : reflection ? (
            <Card className="mt-3">
              <Text className="text-base leading-7 text-slate-700 dark:text-slate-300">
                {reflection.text}
              </Text>
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
        </>
      ) : null}

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Earlier</Text>
      </SectionHeading>

      {reflections.isPending ? (
        <SkeletonCard lines={2} />
      ) : reflections.isError ? (
        <ErrorState
          title="Could not load your journal"
          message={errorMessage(reflections.error)}
          onRetry={() => void reflections.refetch()}
        />
      ) : earlier.length === 0 ? (
        <Card>
          <EmptyState
            icon="book-outline"
            title="Your journal starts today"
            description="Write your first reflection and it will collect here."
            className="py-6"
          />
        </Card>
      ) : (
        <Card padded={false} className="overflow-hidden rounded-2xl">
          {earlier.map((entry, index) => (
            <Row
              key={entry.reflectionId}
              title={formatDueDate(entry.date) ?? entry.date}
              subtitle={preview(entry.text)}
              icon="book"
              tone="primary"
              onPress={() =>
                router.push({
                  pathname: '/insights/journal/[id]',
                  params: { id: entry.reflectionId },
                })
              }
              last={index === earlier.length - 1}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
