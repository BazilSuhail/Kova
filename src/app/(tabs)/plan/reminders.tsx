import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Reminder } from '@/lib/api';
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
import { SectionHeading } from '@/components/ui/section-heading';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useUpcomingReminders,
} from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, dayLabel, formatDateTime, todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback, warnFeedback } from '@/lib/haptics';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

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
  for (let slot = 16; slot <= 42; slot += 1) {
    const hour = Math.floor(slot / 2);
    const minute = slot % 2 === 0 ? 0 : 30;
    const value = `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
    options.push({ value, label: labelForTime(hour, minute) });
  }
  return options;
})();

function fireAtFor(day: string, time: string): string {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, dayOfMonth, hour, minute).toISOString();
}

export default function RemindersScreen() {
  const colors = useThemeColors();
  const { confirm } = useDialog();
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

  async function confirmDelete(reminder: Reminder) {
    const ok = await confirm({
      title: 'Delete reminder',
      message: `"${reminder.title}" will be removed.`,
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) void runDelete(reminder);
  }

  function refresh() {
    void reminders.refetch();
    void upcoming.refetch();
  }

  function pickStatus(next: ReminderStatus) {
    selectFeedback();
    setStatus(next);
  }

  return (
    <Screen scroll={false}>
      <AppBar
        left={<BackButton fallback="/plan" />}
        brand={false}
        title="Reminders"
        actions={[{ icon: 'add', accessibilityLabel: 'New reminder', onPress: openSheet }]}
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingHorizontal: layout.gutter,
            paddingVertical: spacing.sm,
          }}
        >
          <Chip
            label="Pending"
            icon="alarm-outline"
            selected={status === 'pending'}
            onPress={() => pickStatus('pending')}
          />
          <Chip
            label="Sent"
            icon="checkmark-done-outline"
            selected={status === 'sent'}
            onPress={() => pickStatus('sent')}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={reminders.isRefetching || upcoming.isRefetching}
            onRefresh={refresh}
            tintColor={colors.brandInk}
          />
        }
      >
        <Pressable
          onPress={openSheet}
          accessibilityRole="button"
          className="min-h-14 flex-row items-center border-b border-border active:bg-surface-alt"
          style={{ gap: spacing.md }}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.brandInk} />
          <Text className="flex-1 text-base text-brand-ink">New reminder</Text>
        </Pressable>

        {actionError ? (
          <View className="mt-4">
            <FormError message={actionError} />
          </View>
        ) : null}

        {status === 'pending' ? (
          <>
            <SectionHeading>
              <Heading icon="time-outline" title="Next 48 hours" />
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
              <Text className="text-sm text-muted">Nothing in the next two days.</Text>
            ) : (
              soon.map((reminder) => <ReminderRow key={reminder.reminderId} reminder={reminder} />)
            )}
          </>
        ) : null}

        <SectionHeading action={<Text className="text-xs text-muted">{list.length} total</Text>}>
          <Heading
            icon={status === 'sent' ? 'checkmark-done-outline' : 'alarm-outline'}
            title={status === 'sent' ? 'Sent' : 'All pending'}
          />
        </SectionHeading>

        {reminders.isPending ? (
          <View style={{ gap: spacing.md }}>
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </View>
        ) : reminders.isError ? (
          <ErrorState
            title="Could not load your reminders"
            message={errorMessage(reminders.error)}
            onRetry={() => void reminders.refetch()}
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={status === 'sent' ? 'checkmark-done-circle-outline' : 'alarm-outline'}
            title={status === 'sent' ? 'Nothing sent yet' : 'No pending reminders'}
            description={
              status === 'sent'
                ? 'Reminders that have fired collect here.'
                : 'Add one and Kova nudges you on time.'
            }
            actionLabel="New reminder"
            onAction={openSheet}
            className="py-6"
          />
        ) : (
          list.map((reminder, index) => (
            <Animated.View
              key={reminder.reminderId}
              entering={FadeInDown.duration(220).delay(Math.min(index, 10) * 40)}
            >
              <ReminderRow reminder={reminder} onDelete={() => void confirmDelete(reminder)} />
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Sheet
        visible={sheetOpen}
        onClose={closeSheet}
        title="New reminder"
        subtitle="A title and a time is all it needs."
        icon="alarm-outline"
      >
        {formError ? <FormError message={formError} /> : null}

        <Input
          label="Title"
          icon="text-outline"
          placeholder="Call the dentist"
          value={title}
          onChangeText={setTitle}
          editable={!create.isPending}
        />

        <Input
          label="Note (optional)"
          icon="document-text-outline"
          placeholder="Anything to add"
          value={message}
          onChangeText={setMessage}
          editable={!create.isPending}
          multiline
        />

        <FieldLabel icon="calendar-outline" label="Day" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: spacing.sm }}
        >
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

        <View className="mt-6">
          <FieldLabel icon="time-outline" label="Time" />
        </View>
        <View className="flex-row flex-wrap" style={{ gap: spacing.sm }}>
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

        <View className="mt-6 flex-row" style={{ gap: spacing.sm }}>
          <Button
            className="flex-1"
            label="Create reminder"
            icon="checkmark"
            size="md"
            loading={create.isPending}
            onPress={() => void submit()}
          />
          <Button
            className="flex-1"
            label="Cancel"
            variant="secondary"
            size="md"
            disabled={create.isPending}
            onPress={closeSheet}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

function Heading({ icon, title }: { icon: IconName; title: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center" style={{ gap: spacing.sm }}>
      <Ionicons name={icon} size={18} color={colors.heading} />
      <Text className="text-base font-semibold text-heading">{title}</Text>
    </View>
  );
}

function FieldLabel({ icon, label }: { icon: IconName; label: string }) {
  const colors = useThemeColors();
  return (
    <View className="mb-2 flex-row items-center" style={{ gap: 6 }}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text className="text-sm font-medium text-heading">{label}</Text>
    </View>
  );
}

function ReminderRow({ reminder, onDelete }: { reminder: Reminder; onDelete?: () => void }) {
  const colors = useThemeColors();
  const sent = reminder.status === 'sent';

  return (
    <View
      className="min-h-16 flex-row items-center border-b border-border py-3"
      style={{ gap: spacing.lg }}
    >
      <Ionicons
        name={sent ? 'checkmark-done-outline' : 'alarm-outline'}
        size={20}
        color={sent ? colors.successInk : colors.brandInk}
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[15px] font-medium text-heading">
          {reminder.title}
        </Text>
        {reminder.message ? (
          <Text numberOfLines={2} className="mt-0.5 text-xs text-muted">
            {reminder.message}
          </Text>
        ) : null}
        <Text className="mt-0.5 text-xs text-muted">
          {formatDateTime(reminder.fireAt) ?? 'No time set'}
        </Text>
      </View>
      {onDelete ? (
        <IconButton
          icon="trash-outline"
          size={18}
          color={colors.muted}
          accessibilityLabel={`Delete ${reminder.title}`}
          onPress={onDelete}
        />
      ) : null}
    </View>
  );
}
