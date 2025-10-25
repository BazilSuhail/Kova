import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useConvertSummaryToTask, useDeleteSummary, useSummary, useUpdateSummary } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { layout, spacing } from '@/config/theme';

function summaryTitle(sourceType: string, originalFileName: string): string {
  const label = sourceType.toLowerCase() === 'pdf' ? 'PDF' : 'Note';
  return originalFileName ? `${label} · ${originalFileName}` : label;
}

export default function SummaryDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const summaryId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const query = useSummary(summaryId);
  const convert = useConvertSummaryToTask();
  const update = useUpdateSummary();
  const remove = useDeleteSummary();
  const { confirm } = useDialog();

  const [menuOpen, setMenuOpen] = useState(false);
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

  async function confirmDelete() {
    const ok = await confirm({
      title: 'Delete summary',
      message: 'This removes the bullets from your library.',
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    warnFeedback();
    remove.mutate(summaryId, { onSuccess: goBack });
  }

  function body() {
    if (query.isLoading) return <SkeletonCard lines={3} />;

    if (query.isError) {
      return (
        <ErrorState
          title="Could not open this summary"
          message={errorMessage(query.error)}
          onRetry={query.refetch}
        />
      );
    }

    if (!summary) {
      return (
        <EmptyState
          icon="document-text-outline"
          title="Summary not found"
          description="It may have been deleted, or the link is out of date."
          actionLabel="Back to library"
          onAction={() => router.replace('/insights/library')}
        />
      );
    }

    const created = formatDateTime(summary.createdAt);

    return (
      <Animated.View entering={FadeInDown.duration(220)}>
        <Text className="text-2xl font-bold tracking-tight text-heading">
          {summaryTitle(summary.sourceType, summary.originalFileName)}
        </Text>
        {created ? <Text className="mt-1 text-sm text-muted">Created {created}</Text> : null}

        {actionError ? (
          <View className="mt-4">
            <FormError message={actionError} />
          </View>
        ) : null}

        <Card padded={false} className="mt-6 overflow-hidden">
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
                style={{ gap: spacing.md }}
              >
                <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-soft">
                  <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm leading-6 text-body">{bullet}</Text>
              </View>
            ))
          )}
        </Card>

        <View className="mt-6" style={{ gap: spacing.sm }}>
          <Button
            label="Create a task from this"
            icon="add-circle-outline"
            loading={convert.isPending}
            onPress={() => void createTask()}
          />
          <Button label="Edit bullets" variant="secondary" icon="create-outline" onPress={openEdit} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Summary"
        left={<BackButton fallback="/insights/library" />}
        actions={
          summary
            ? [
                {
                  icon: 'ellipsis-vertical',
                  accessibilityLabel: 'More',
                  onPress: () => setMenuOpen(true),
                },
              ]
            : undefined
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {body()}
      </ScrollView>

      <Sheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Summary"
        actions={[
          {
            icon: 'add-circle-outline',
            label: 'Create a task',
            disabled: convert.isPending,
            onPress: () => void createTask(),
          },
          { icon: 'create-outline', label: 'Edit bullets', onPress: openEdit },
          {
            icon: 'trash-outline',
            label: 'Delete summary',
            destructive: true,
            disabled: remove.isPending,
            onPress: () => void confirmDelete(),
          },
        ]}
      />

      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        icon="create-outline"
        title="Edit bullets"
        subtitle="Tidy the wording or drop what is not useful."
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

        <View className="flex-row" style={{ gap: spacing.sm }}>
          <View className="flex-1">
            <Button
              label="Save"
              icon="checkmark"
              loading={update.isPending}
              onPress={() => void saveEdit()}
            />
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
      </Sheet>
    </Screen>
  );
}
