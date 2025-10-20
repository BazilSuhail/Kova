import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { Reminder } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Fab } from '@/components/ui/fab';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useUpcomingReminders,
} from '@/hooks/queries/plan';
import { errorMessage } from '@/lib/errors';
import { formatDateTime, todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback, warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

type ReminderStatus = 'pending' | 'sent';
type TimeOption = { value: string; label: string };

function labelForTime(hour: number, minute: number): string {
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const TIME_OPTIONS: TimeOption[] = (() => {
  const options: TimeOption[] = [];
  // 08:00 through 21:00 inclusive, one option every half hour.
  for (let slot = 16; slot <= 42; slot += 1) {
    const hour = Math.floor(slot / 2);
    const minute = slot % 2 === 0 ? 0 : 30;
    const value = `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
    options.push({ value, label: labelForTime(hour, minute) });
  }
  return options;
})();

/** `YYYY-MM-DD` shifted by whole local days; a date-only string never reaches `new Date(string)`. */
function addDays(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + n);
  const nextMonth = `${date.getMonth() + 1}`.padStart(2, '0');
  const nextDay = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

function dayLabel(iso: string): string {
  if (iso === todayIsoDate()) return 'Today';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  });
}

/** A local instant from the chosen day and time, sent as UTC so the server stores the moment. */
function fireAtFor(day: string, time: string): string {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, dayOfMonth, hour, minute).toISOString();
}

export default function RemindersScreen() {
  const colors = useThemeColors();
  const [status, setStatus] = useState<ReminderStatus>('pending');
  const reminders = useReminders(status);
  const upcoming = useUpcomingReminders();
  const create = useCreateReminder();
  const remove = useDeleteReminder();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [day, setDay] = useState(todayIsoDate());
  const [time, setTime] = useState('09:00');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, index) => addDays(todayIsoDate(), index)),
    [],
  );

  const list = reminders.data ?? [];
  const soon = upcoming.data ?? [];

  function openSheet() {
    setFormError(null);
    setSheetOpen(true);
  }

  function resetForm() {
    setTitle('');
    setMessage('');
    setDay(todayIsoDate());
    setTime('09:00');
    setFormError(null);
  }

  function closeSheet() {
    if (create.isPending) return;
    resetForm();
    setSheetOpen(false);
  }

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError('Give the reminder a title.');
      return;
    }
    setFormError(null);
    try {
      await create.mutateAsync({
        title: trimmed,
        message: message.trim() || undefined,
        fireAt: fireAtFor(day, time),
      });
      successFeedback();
      resetForm();
      setSheetOpen(false);
    } catch (failure) {
      setFormError(errorMessage(failure));
    }
  }

  async function runDelete(reminder: Reminder) {
    setActionError(null);
    try {
      await remove.mutateAsync(reminder.reminderId);
      warnFeedback();
    } catch (failure) {
      setActionError(errorMessage(failure));
    }
  }

  function confirmDelete(reminder: Reminder) {
    // RN Web has no button-capable Alert, so it deletes straight away.
    if (Platform.OS === 'web') {
      void runDelete(reminder);
      return;
    }
    Alert.alert('Delete reminder', `"${reminder.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void runDelete(reminder) },
    ]);
  }

  function refresh() {
    void reminders.refetch();
    void upcoming.refetch();
  }

  const back = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
      className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="chevron-back" size={18} color={colors.text} />
    </Pressable>
  );

  return (
    <Screen scroll={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={reminders.isRefetching || upcoming.isRefetching}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }>
        <View className="mb-4 flex-row items-center">{back}</View>

        <ScreenHeader
          eyebrow="Plan"
          title="Reminders"
          subtitle="Nudge yourself once, then let it go."
        />

        {actionError ? (
          <View className="mt-4">
            <FormError message={actionError} />
          </View>
        ) : null}

        <SectionHeading>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
            Next 48 hours
          </Text>
        </SectionHeading>

        {upcoming.isPending ? (
          <SkeletonCard lines={1} />
        ) : upcoming.isError ? (
          <ErrorState
            title="Could not load upcoming reminders"
            message={errorMessage(upcoming.error)}
            onRetry={() => void upcoming.refetch()}
          />
        ) : soon.length === 0 ? (
          <Card>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Nothing scheduled in the next two days.
            </Text>
          </Card>
        ) : (
          <Card padded={false} className="overflow-hidden rounded-2xl">
            {soon.map((reminder, index) => (
              <View
                key={reminder.reminderId}
                className={`flex-row items-center px-4 py-3 ${
                  index < soon.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
                }`}
                style={{ gap: 12 }}>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                  <Ionicons name="alarm-outline" size={17} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {reminder.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(reminder.fireAt) ?? 'No time set'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <SectionHeading
          action={
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {list.length} total
            </Text>
          }>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Reminders</Text>
        </SectionHeading>

        <View className="flex-row" style={{ gap: 8 }}>
          <Chip
            label="Pending"
            selected={status === 'pending'}
            onPress={() => {
              selectFeedback();
              setStatus('pending');
            }}
          />
          <Chip
            label="Sent"
            selected={status === 'sent'}
            onPress={() => {
              selectFeedback();
              setStatus('sent');
            }}
          />
        </View>

        <View className="mt-3" style={{ gap: 8 }}>
          {reminders.isPending ? (
            <>
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
            </>
          ) : reminders.isError ? (
            <ErrorState
              title="Could not load your reminders"
              message={errorMessage(reminders.error)}
              onRetry={() => void reminders.refetch()}
            />
          ) : list.length === 0 ? (
            <Card>
              <EmptyState
                icon={status === 'sent' ? 'checkmark-done-circle' : 'alarm-outline'}
                title={status === 'sent' ? 'Nothing sent yet' : 'No pending reminders'}
                description={
                  status === 'sent'
                    ? 'Reminders that have fired will collect here.'
                    : 'Add one and Kova will nudge you on time.'
                }
                actionLabel="New reminder"
                onAction={openSheet}
                className="py-6"
              />
            </Card>
          ) : (
            list.map((reminder) => (
              <View
                key={reminder.reminderId}
                className="flex-row items-start rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                style={{ gap: 12 }}>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                  <Ionicons
                    name={reminder.status === 'sent' ? 'checkmark-done' : 'alarm-outline'}
                    size={17}
                    color={reminder.status === 'sent' ? colors.success : colors.primary}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {reminder.title}
                  </Text>
                  {reminder.message ? (
                    <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {reminder.message}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(reminder.fireAt) ?? 'No time set'}
                  </Text>
                </View>

                <View className="items-end" style={{ gap: 8 }}>
                  <Chip
                    label={reminder.status === 'sent' ? 'Sent' : 'Pending'}
                    selected={reminder.status !== 'sent'}
                  />
                  <Pressable
                    onPress={() => confirmDelete(reminder)}
                    onLongPress={() => confirmDelete(reminder)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${reminder.title}`}
                    className="h-8 w-8 items-center justify-center rounded-full active:opacity-70">
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Fab onPress={openSheet} accessibilityLabel="New reminder" />

      <Sheet
        visible={sheetOpen}
        onClose={closeSheet}
        title="New reminder"
        subtitle="A title and a time is all it needs.">
        <ScrollView
          style={{ maxHeight: 480 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {formError ? <FormError message={formError} /> : null}

          <Input
            label="Title"
            placeholder="Call the dentist"
            value={title}
            onChangeText={setTitle}
            editable={!create.isPending}
          />

          <Input
            label="Message"
            placeholder="Optional note"
            value={message}
            onChangeText={setMessage}
            editable={!create.isPending}
            multiline
          />

          <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Day</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {days.map((iso) => (
              <Chip
                key={iso}
                label={dayLabel(iso)}
                selected={iso === day}
                onPress={() => {
                  selectFeedback();
                  setDay(iso);
                }}
              />
            ))}
          </ScrollView>

          <Text className="mb-2 mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Time
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {TIME_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={option.value === time}
                onPress={() => {
                  selectFeedback();
                  setTime(option.value);
                }}
              />
            ))}
          </View>

          <View className="mt-5" style={{ gap: 8 }}>
            <Button
              label="Create reminder"
              icon="add"
              loading={create.isPending}
              onPress={() => void submit()}
            />
            <Button
              label="Cancel"
              variant="secondary"
              size="md"
              disabled={create.isPending}
              onPress={closeSheet}
            />
          </View>
        </ScrollView>
      </Sheet>
    </Screen>
  );
}
