import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';

import type { Summary } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Sheet } from '@/components/ui/sheet';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreateSummaryFromPdf,
  useCreateSummaryFromText,
  useDeleteSummary,
  useSummaries,
} from '@/hooks/queries/insights';
import { errorMessage } from '@/lib/errors';
import { relativeTime } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { extensionFor, type UploadFile } from '@/lib/upload';
import { useThemeColors } from '@/theme/colors';

const MIN_TEXT_LENGTH = 20;

/** "PDF · notes.pdf" for an upload, "Note" for pasted text. */
function summaryTitle(summary: Summary): string {
  const label = summary.sourceType.toLowerCase() === 'pdf' ? 'PDF' : 'Note';
  return summary.originalFileName ? `${label} · ${summary.originalFileName}` : label;
}

/**
 * Typed routes do not expand this nested dynamic segment, so the composed path is cast to
 * `Href`; the route it resolves to is `/insights/library/[id]`.
 */
function summaryHref(summaryId: string): Href {
  return `/insights/library/${summaryId}` as Href;
}

export default function LibraryScreen() {
  const colors = useThemeColors();
  const summaries = useSummaries();
  const createFromText = useCreateSummaryFromText();
  const createFromPdf = useCreateSummaryFromPdf();
  const remove = useDeleteSummary();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const items = useMemo(
    () => summaries.data?.pages.flatMap((page) => page.items) ?? [],
    [summaries.data],
  );

  function resetForm() {
    setText('');
    setTitle('');
    setFormError(null);
  }

  function closeSheet() {
    setSheetOpen(false);
    resetForm();
  }

  function openSheet() {
    resetForm();
    setSheetOpen(true);
  }

  async function createFromNote() {
    if (text.trim().length < MIN_TEXT_LENGTH) {
      setFormError('Add at least a sentence or two before summarising.');
      return;
    }

    setFormError(null);
    try {
      const result = await createFromText.mutateAsync({
        text: text.trim(),
        title: title.trim() || undefined,
      });
      successFeedback();
      closeSheet();
      router.push(summaryHref(result.summary.summaryId));
    } catch (failure) {
      setFormError(errorMessage(failure));
    }
  }

  async function createFromPicker() {
    setFormError(null);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;

      const asset = picked.assets[0];
      if (!asset) return;

      const file: UploadFile = {
        uri: asset.uri,
        name: asset.name || `summary.${extensionFor(asset.mimeType, 'pdf')}`,
        type: asset.mimeType ?? 'application/pdf',
      };

      const result = await createFromPdf.mutateAsync(file);
      successFeedback();
      closeSheet();
      router.push(summaryHref(result.summary.summaryId));
    } catch (failure) {
      setFormError(errorMessage(failure));
    }
  }

  function confirmDelete(summary: Summary) {
    const run = () => {
      warnFeedback();
      remove.mutate(summary.summaryId);
    };

    // RN Web has no button-capable Alert, so it deletes straight away.
    if (Platform.OS === 'web') {
      run();
      return;
    }

    Alert.alert('Delete summary', 'This removes the bullets from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  }

  function emptyState() {
    if (summaries.isPending) {
      return (
        <View style={{ gap: 12, marginTop: 12 }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      );
    }

    if (summaries.isError) {
      return (
        <ErrorState
          title="Could not load your summaries"
          message={errorMessage(summaries.error)}
          onRetry={() => void summaries.refetch()}
        />
      );
    }

    return (
      <EmptyState
        icon="document-text-outline"
        title="No summaries yet"
        description="Paste a note or upload a PDF and Kova will pull out the key points."
        actionLabel="Add a summary"
        onAction={openSheet}
      />
    );
  }

  return (
    <Screen
      scroll={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
      <ScreenHeader
        eyebrow="Insights"
        title="Summaries"
        subtitle="Turn notes, transcripts and PDFs into clear bullets."
        back
        backFallback="/insights"
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.summaryId}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshing={summaries.isRefetching && !summaries.isFetchingNextPage}
        onRefresh={() => void summaries.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (summaries.hasNextPage && !summaries.isFetchingNextPage) {
            void summaries.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          <Card
            onPress={openSheet}
            className="flex-row items-center border-violet-200 dark:border-violet-900">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
              <Ionicons name="add" size={20} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add a summary</Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Paste a note or upload a PDF
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Card>
        }
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          summaries.isFetchingNextPage ? (
            <Skeleton height={72} radius={24} style={{ marginTop: 8 }} />
          ) : null
        }
        renderItem={({ item }) => {
          const preview = item.summaryBullets[0];
          const count = item.summaryBullets.length;
          const when = relativeTime(item.createdAt);

          return (
            <Pressable
              onPress={() => router.push(summaryHref(item.summaryId))}
              onLongPress={() => confirmDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${summaryTitle(item)}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Ionicons
                  name={item.sourceType.toLowerCase() === 'pdf' ? 'document-text-outline' : 'reader-outline'}
                  size={15}
                  color={colors.primary}
                />
                <Text
                  numberOfLines={1}
                  className="flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {summaryTitle(item)}
                </Text>
                {when ? (
                  <Text className="text-xs text-slate-500 dark:text-slate-400">{when}</Text>
                ) : null}
              </View>

              {preview ? (
                <Text
                  numberOfLines={2}
                  className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-400">
                  {preview}
                </Text>
              ) : null}

              <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {count} {count === 1 ? 'bullet' : 'bullets'}
              </Text>
            </Pressable>
          );
        }}
      />

      <Sheet
        visible={sheetOpen}
        onClose={closeSheet}
        title="Add a summary"
        subtitle="Turn a note, transcript or PDF into a few clear bullets.">
        <Input
          label="Title (optional)"
          placeholder="e.g. Lecture 4"
          value={title}
          onChangeText={setTitle}
          editable={!createFromText.isPending && !createFromPdf.isPending}
        />
        <Input
          label="Note or transcript"
          placeholder="Paste the text you want summarised…"
          value={text}
          onChangeText={setText}
          multiline
          hint="At least 20 characters."
          editable={!createFromText.isPending && !createFromPdf.isPending}
        />

        {formError ? <FormError message={formError} /> : null}

        <Button
          label="Create summary"
          loading={createFromText.isPending}
          disabled={createFromPdf.isPending}
          onPress={() => void createFromNote()}
        />
        <View className="mt-3">
          <Button
            label="Upload a PDF"
            variant="secondary"
            icon="document-attach-outline"
            loading={createFromPdf.isPending}
            disabled={createFromText.isPending}
            onPress={() => void createFromPicker()}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
