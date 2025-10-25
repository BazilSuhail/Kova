import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { useDialog } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteReflection, useReflection } from '@/lib/api';
import { errorMessage, isNotFound } from '@/lib/errors';
import { formatDateTime, formatDueDate } from '@/lib/format';
import { warnFeedback } from '@/lib/haptics';
import { layout, spacing } from '@/config/theme';

export default function JournalEntryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const reflectionId = params.id;
  const reflection = useReflection(reflectionId);
  const remove = useDeleteReflection();
  const { confirm } = useDialog();
  const [menuOpen, setMenuOpen] = useState(false);

  const entry = reflection.data;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/insights/journal');
  }

  async function confirmDelete() {
    const ok = await confirm({
      title: 'Delete reflection',
      message: 'This entry will be removed from your journal.',
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    warnFeedback();
    remove.mutate(reflectionId, { onSuccess: goBack });
  }

  function body() {
    if (reflection.isPending) return <SkeletonCard lines={3} />;

    if (reflection.isError || !entry) {
      const gone = isNotFound(reflection.error);
      return (
        <ErrorState
          title="Could not open this entry"
          message={gone ? 'This reflection no longer exists.' : errorMessage(reflection.error)}
          onRetry={gone ? undefined : () => void reflection.refetch()}
        />
      );
    }

    const created = formatDateTime(entry.createdAt);
    return (
      <Animated.View entering={FadeInDown.duration(220)}>
        <Text className="text-2xl font-bold tracking-tight text-heading">
          {formatDueDate(entry.date) ?? entry.date}
        </Text>
        {created ? <Text className="mt-1 text-sm text-muted">{created}</Text> : null}

        {entry.prompt ? (
          <Card className="mt-6">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              The prompt
            </Text>
            <Text className="mt-2 text-sm font-medium leading-5 text-body">{entry.prompt}</Text>
          </Card>
        ) : null}

        <Text className="mt-6 text-base leading-7 text-body">{entry.text}</Text>
      </Animated.View>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Reflection"
        left={<BackButton fallback="/insights/journal" />}
        actions={
          entry
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
        title="Reflection"
        actions={[
          {
            icon: 'trash-outline',
            label: 'Delete reflection',
            destructive: true,
            disabled: remove.isPending,
            onPress: () => void confirmDelete(),
          },
        ]}
      />
    </Screen>
  );
}
