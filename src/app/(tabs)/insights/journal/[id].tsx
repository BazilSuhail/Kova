import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { useDeleteReflection, useReflection } from '@/lib/api';
import { errorMessage, isNotFound } from '@/lib/errors';
import { formatDateTime, formatDueDate } from '@/lib/format';
import { warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

export default function JournalEntryScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id: string }>();
  const reflectionId = params.id;
  const reflection = useReflection(reflectionId);
  const remove = useDeleteReflection();

  const entry = reflection.data;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/insights/journal');
  }

  function confirmDelete() {
    if (Platform.OS === 'web') {
      warnFeedback();
      remove.mutate(reflectionId, { onSuccess: goBack });
      return;
    }
    Alert.alert('Delete reflection', 'This entry will be removed from your journal.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          warnFeedback();
          remove.mutate(reflectionId, { onSuccess: goBack });
        },
      },
    ]);
  }

  const back = <BackButton fallback="/insights/journal" />;

  if (reflection.isPending) {
    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <SkeletonCard lines={3} />
      </Screen>
    );
  }

  if (reflection.isError || !entry) {
    const gone = isNotFound(reflection.error);

    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <ErrorState
          title="Could not open this entry"
          message={gone ? 'This reflection no longer exists.' : errorMessage(reflection.error)}
          onRetry={gone ? undefined : () => void reflection.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-4">{back}</View>

      <ScreenHeader
        icon="book-outline"
        eyebrow="Reflection"
        title={formatDueDate(entry.date) ?? entry.date}
        subtitle={formatDateTime(entry.createdAt) ?? undefined}
        right={
          <Pressable
            onPress={confirmDelete}
            disabled={remove.isPending}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Delete reflection"
            className={`h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70 ${
              remove.isPending ? 'opacity-60' : ''
            }`}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        }
      />

      {entry.prompt ? (
        <Card className="mt-5 border-border">
          <Text className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
            The prompt
          </Text>
          <Text className="mt-2 text-sm font-medium leading-5 text-body">{entry.prompt}</Text>
        </Card>
      ) : null}

      <Card className="mt-3">
        <Text className="text-base leading-7 text-body">{entry.text}</Text>
      </Card>
    </Screen>
  );
}
