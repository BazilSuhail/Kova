import { useState } from 'react';
import { Text, View } from 'react-native';

import type { SyncPull } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormError } from '@/components/ui/form-error';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSyncPull } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import type { IconName } from '@/theme/icons';

type CollectionKey =
  | 'tasks'
  | 'subtasks'
  | 'planner'
  | 'summaries'
  | 'notifications'
  | 'mood'
  | 'reflections'
  | 'reminders';

const COLLECTIONS: { key: CollectionKey; label: string; icon: IconName }[] = [
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
  { key: 'subtasks', label: 'Subtasks', icon: 'list-outline' },
  { key: 'planner', label: 'Planner', icon: 'calendar-outline' },
  { key: 'summaries', label: 'Summaries', icon: 'document-text-outline' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { key: 'mood', label: 'Mood entries', icon: 'happy-outline' },
  { key: 'reflections', label: 'Reflections', icon: 'book-outline' },
  { key: 'reminders', label: 'Reminders', icon: 'alarm-outline' },
];

function CountPill({ count }: { count: number }) {
  const active = count > 0;

  return (
    <View className={`rounded-full px-2.5 py-1 ${active ? 'bg-brand-soft' : 'bg-surface-alt'}`}>
      <Text className={`text-xs font-bold ${active ? 'text-brand-ink' : 'text-muted'}`}>
        {count}
      </Text>
    </View>
  );
}

export default function SyncScreen() {
  const syncPull = useSyncPull();

  const [lastSync, setLastSync] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<SyncPull | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSync(since: string | undefined) {
    setError(null);
    try {
      const data = await syncPull.mutateAsync(since);
      setResult(data);
      setLastSync(data.serverTime || undefined);
      successFeedback();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  function fullSync() {
    selectFeedback();
    setLastSync(undefined);
    void runSync(undefined);
  }

  return (
    <Screen>
      <ScreenHeader
        icon="cloud-upload-outline"
        eyebrow="Sync"
        title="Sync"
        subtitle="Pull the latest copy of your data from the server."
        back
        backFallback="/profile"
      />

      <Card className="mt-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-heading">Last synced</Text>
          <Text className="text-sm text-muted">
            {lastSync ? formatDateTime(lastSync) : 'Never'}
          </Text>
        </View>

        <View className="mt-4" style={{ gap: 10 }}>
          <Button
            label="Sync now"
            icon="sync"
            loading={syncPull.isPending}
            onPress={() => void runSync(lastSync)}
          />
          <Button
            label="Full sync"
            variant="secondary"
            size="md"
            icon="cloud-download-outline"
            disabled={syncPull.isPending}
            onPress={fullSync}
          />
        </View>

        <Text className="mt-3 text-xs leading-5 text-muted">
          Sync now fetches what changed. Full sync fetches everything again.
        </Text>
      </Card>

      {error ? (
        <View className="mt-4">
          <FormError message={error} />
        </View>
      ) : null}

      {result ? (
        <>
          <SectionHeading action={<Chip label={result.full ? 'Full pull' : 'Incremental'} />}>
            <Text className="text-base font-bold text-heading">Last pull</Text>
          </SectionHeading>

          <Card padded={false} className="overflow-hidden">
            {COLLECTIONS.map((collection) => (
              <Row
                key={collection.key}
                title={collection.label}
                icon={collection.icon}
                right={<CountPill count={result[collection.key].length} />}
              />
            ))}
            <Row
              title="Deleted (tombstones)"
              icon="trash-outline"
              tone="danger"
              right={<CountPill count={result.deleted.length} />}
              last
            />
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
