import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Summary } from '@/lib/api';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreateSummaryFromPdf,
  useCreateSummaryFromText,
  useDeleteSummary,
  useSummaries,
} from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { relativeTime } from '@/lib/format';
import { selectFeedback, successFeedback, warnFeedback } from '@/lib/haptics';
import { extensionFor, type UploadFile } from '@/lib/upload';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const MIN_TEXT_LENGTH = 20;

type Filter = 'all' | 'note' | 'pdf';

const FILTERS: { value: Filter; label: string; icon: IconName }[] = [
  { value: 'all', label: 'All', icon: 'albums-outline' },
  { value: 'note', label: 'Notes', icon: 'reader-outline' },
  { value: 'pdf', label: 'PDFs', icon: 'document-text-outline' },
];

function isPdf(summary: Summary): boolean {
  return summary.sourceType.toLowerCase() === 'pdf';
}

function summaryTitle(summary: Summary): string {
  const label = isPdf(summary) ? 'PDF' : 'Note';
  return summary.originalFileName ? `${label} · ${summary.originalFileName}` : label;
}

function summaryHref(summaryId: string): Href {
  return `/insights/library/${summaryId}` as Href;
}

export default function LibraryScreen() {
  const colors = useThemeColors();
  const { confirm } = useDialog();
  const summaries = useSummaries();
  const createFromText = useCreateSummaryFromText();
  const createFromPdf = useCreateSummaryFromPdf();
  const remove = useDeleteSummary();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const items = useMemo(() => {
    const all = summaries.data?.pages.flatMap((page) => page.items) ?? [];
    // shortcut: filters only the pages loaded so far; move to the API if libraries get long.
    return filter === 'all' ? all : all.filter((item) => isPdf(item) === (filter === 'pdf'));
  }, [summaries.data, filter]);

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

  async function confirmDelete(summary: Summary) {
    const ok = await confirm({
      title: 'Delete summary',
      message: 'This removes the bullets from your library.',
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    warnFeedback();
    remove.mutate(summary.summaryId);
  }

  function emptyState() {
    if (summaries.isPending) {
      return (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
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

    if (filter !== 'all') {
      return (
        <EmptyState
          icon={filter === 'pdf' ? 'document-text-outline' : 'reader-outline'}
          title={filter === 'pdf' ? 'No PDFs yet' : 'No notes yet'}
          description="Switch to All, or add a new one."
          actionLabel="Add a summary"
          onAction={openSheet}
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

  const busy = createFromText.isPending || createFromPdf.isPending;

  return (
    <Screen scroll={false}>
      <AppBar
        title="Library"
        left={<BackButton fallback="/insights" />}
        actions={[{ icon: 'add', accessibilityLabel: 'Add a summary', onPress: openSheet }]}
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingHorizontal: layout.gutter,
            paddingBottom: spacing.md,
          }}
        >
          {FILTERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={filter === option.value}
              onPress={() => {
                selectFeedback();
                setFilter(option.value);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.summaryId}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        refreshing={summaries.isRefetching && !summaries.isFetchingNextPage}
        onRefresh={() => void summaries.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (summaries.hasNextPage && !summaries.isFetchingNextPage) {
            void summaries.fetchNextPage();
          }
        }}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          summaries.isFetchingNextPage ? (
            <Skeleton height={56} style={{ marginTop: spacing.sm }} />
          ) : undefined
        }
        renderItem={({ item, index }) => {
          const preview = item.summaryBullets[0];
          const count = item.summaryBullets.length;
          const when = relativeTime(item.createdAt);

          return (
            <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 40)}>
              <Pressable
                onPress={() => router.push(summaryHref(item.summaryId))}
                onLongPress={() => setSelected(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${summaryTitle(item)}`}
                className="flex-row items-start border-b border-border py-3 active:bg-surface-alt"
                style={{ gap: spacing.md }}
              >
                <View className="h-10 w-10 items-center justify-center rounded-md bg-brand-soft">
                  <Ionicons
                    name={isPdf(item) ? 'document-text-outline' : 'reader-outline'}
                    size={18}
                    color={colors.brandInk}
                  />
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-[15px] font-medium text-heading">
                    {summaryTitle(item)}
                  </Text>
                  {preview ? (
                    <Text numberOfLines={2} className="mt-0.5 text-sm leading-5 text-body">
                      {preview}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-xs text-muted">
                    {count} {count === 1 ? 'bullet' : 'bullets'}
                    {when ? ` · ${when}` : ''}
                  </Text>
                </View>
                <IconButton
                  icon="ellipsis-vertical"
                  size={18}
                  accessibilityLabel="More"
                  onPress={() => setSelected(item)}
                />
              </Pressable>
            </Animated.View>
          );
        }}
      />

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? summaryTitle(selected) : undefined}
        actions={[
          {
            icon: 'open-outline',
            label: 'Open',
            onPress: () => {
              if (selected) router.push(summaryHref(selected.summaryId));
            },
          },
          {
            icon: 'trash-outline',
            label: 'Delete',
            destructive: true,
            disabled: remove.isPending,
            onPress: () => {
              if (selected) void confirmDelete(selected);
            },
          },
        ]}
      />

      <Sheet
        visible={sheetOpen}
        onClose={closeSheet}
        icon="library-outline"
        title="Add a summary"
        subtitle="Turn a note, transcript or PDF into a few clear bullets."
      >
        <Input
          label="Title (optional)"
          icon="text-outline"
          placeholder="e.g. Lecture 4"
          value={title}
          onChangeText={setTitle}
          editable={!busy}
        />
        <Input
          label="Note or transcript"
          icon="reader-outline"
          placeholder="Paste the text you want summarised…"
          value={text}
          onChangeText={setText}
          multiline
          hint="At least 20 characters."
          editable={!busy}
        />

        {formError ? <FormError message={formError} /> : null}

        <Button
          label="Create summary"
          icon="sparkles-outline"
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
