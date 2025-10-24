import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { useConvertSummaryToTask, useDeleteSummary, useSummary, useUpdateSummary } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

function summaryTitle(sourceType: string, originalFileName: string): string {
  const label = sourceType.toLowerCase() === 'pdf' ? 'PDF' : 'Note';
  return originalFileName ? `${label} · ${originalFileName}` : label;
}

export default function SummaryDetailScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const summaryId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const query = useSummary(summaryId);
  const convert = useConvertSummaryToTask();
  const update = useUpdateSummary();
  const remove = useDeleteSummary();

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const summary = query.summary;
  const bullets = summary?.summaryBullets ?? [];

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/insights/library');
  }

  async function createTask() {
    setActionError(null);
    try {
      const task = await convert.mutateAsync(summaryId);
      successFeedback();
      router.push(`/tasks/${task.taskId}`);
    } catch (failure) {
      setActionError(errorMessage(failure));
    }
  }

  function openEdit() {
    if (!summary) return;
    setDraft(summary.summaryBullets);
    setFormError(null);
    setEditOpen(true);
  }

  async function saveEdit() {
    const next = draft.map((bullet) => bullet.trim()).filter(Boolean);
    if (next.length === 0) {
      setFormError('Keep at least one bullet.');
      return;
    }

    try {
      await update.mutateAsync({ summaryId, bullets: next });
      successFeedback();
      setEditOpen(false);
    } catch (failure) {
      setFormError(errorMessage(failure));
    }
  }

  function confirmDelete() {
    const run = () => {
      warnFeedback();
      remove.mutate(summaryId, { onSuccess: goBack });
    };

    if (Platform.OS === 'web') {
      run();
      return;
    }

    Alert.alert('Delete summary', 'This removes the bullets from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  }

  const back = <BackButton fallback="/insights/library" />;

  if (query.isLoading) {
    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <SkeletonCard lines={3} />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <ErrorState
          title="Could not open this summary"
          message={errorMessage(query.error)}
          onRetry={query.refetch}
        />
      </Screen>
    );
  }

  if (!summary) {
    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <EmptyState
          icon="document-text-outline"
          title="Summary not found"
          description="It may have been deleted, or the link is out of date."
          actionLabel="Back to library"
          onAction={() => router.replace('/insights/library')}
        />
      </Screen>
    );
  }

  const created = formatDateTime(summary.createdAt);

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-4 flex-row items-center justify-between">
        {back}
        <Pressable
          onPress={confirmDelete}
          disabled={remove.isPending}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Delete summary"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>

      <ScreenHeader
        icon="document-text-outline"
        eyebrow="Summary"
        title={summaryTitle(summary.sourceType, summary.originalFileName)}
        subtitle={created ? `Created ${created}` : undefined}
      />

      {actionError ? (
        <View className="mt-4">
          <FormError message={actionError} />
        </View>
      ) : null}

      <Card padded={false} className="mt-5 overflow-hidden rounded-2xl">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-sm font-semibold text-heading">Key points</Text>
          <Text className="text-xs text-muted">
            {bullets.length} {bullets.length === 1 ? 'bullet' : 'bullets'}
          </Text>
        </View>

        {bullets.length === 0 ? (
          <Text className="border-t border-border px-4 py-4 text-sm text-muted">
            No bullets were returned for this summary. Try editing it to add your own.
          </Text>
        ) : (
          bullets.map((bullet, index) => (
            <View
              key={`${index}-${bullet}`}
              className="flex-row items-start border-t border-border px-4 py-3"
              style={{ gap: 10 }}
            >
              <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
              <Text className="flex-1 text-sm leading-6 text-body">{bullet}</Text>
            </View>
          ))
        )}
      </Card>

      <View className="mt-6" style={{ gap: 8 }}>
        <Button
          label="Create a task from this"
          icon="add-circle-outline"
          loading={convert.isPending}
          onPress={() => void createTask()}
        />
        <Button label="Edit bullets" variant="secondary" icon="create-outline" onPress={openEdit} />
      </View>

      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit bullets"
        subtitle="Tidy the wording or drop what is not useful."
      >
        <ScrollView
          style={{ maxHeight: 420 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {draft.map((bullet, index) => (
            <Input
              key={index}
              label={`Bullet ${index + 1}`}
              value={bullet}
              onChangeText={(value) =>
                setDraft((current) => current.map((entry, i) => (i === index ? value : entry)))
              }
              multiline
              editable={!update.isPending}
            />
          ))}

          {formError ? <FormError message={formError} /> : null}

          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-1">
              <Button label="Save" loading={update.isPending} onPress={() => void saveEdit()} />
            </View>
            <View className="flex-1">
              <Button
                label="Cancel"
                variant="secondary"
                disabled={update.isPending}
                onPress={() => setEditOpen(false)}
              />
            </View>
          </View>
        </ScrollView>
      </Sheet>
    </Screen>
  );
}
