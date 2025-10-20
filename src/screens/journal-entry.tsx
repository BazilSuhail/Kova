import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteReflection, useReflection } from '@/hooks/queries/insights';
import { errorMessage, isNotFound } from '@/lib/errors';
import { formatDateTime, formatDueDate } from '@/lib/format';
import { warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

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
    // RN Web has no button-capable Alert, so it deletes straight away.
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
            className={`h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white active:opacity-70 dark:border-red-900 dark:bg-slate-900 ${
              remove.isPending ? 'opacity-60' : ''
            }`}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        }
      />

      {entry.prompt ? (
        <Card className="mt-5 border-violet-200 dark:border-violet-900">
          <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            The prompt
          </Text>
          <Text className="mt-2 text-sm font-medium leading-5 text-slate-700 dark:text-slate-300">
            {entry.prompt}
          </Text>
        </Card>
      ) : null}

      <Card className="mt-3">
        <Text className="text-base leading-7 text-slate-700 dark:text-slate-300">{entry.text}</Text>
      </Card>
    </Screen>
  );
}
