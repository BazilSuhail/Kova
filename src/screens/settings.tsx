import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { UserSettings } from '@/api/types';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings } from '@/hooks/queries/account';
import { errorMessage } from '@/lib/errors';
import { selectFeedback } from '@/lib/haptics';

type Option = { value: string; label: string };

const THEME_OPTIONS: Option[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const FONT_OPTIONS: Option[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const LAYOUT_OPTIONS: Option[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const STYLE_OPTIONS: Option[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'standard', label: 'Standard' },
  { value: 'firm', label: 'Firm' },
];

const LANGUAGE_OPTIONS: Option[] = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
];

/** A labelled row of single-choice chips. */
function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <View>
      <Text className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

/** The UI kit has no Switch, so the toggle is a plain pill track with a sliding knob. */
function TogglePill({
  value,
  onPress,
  label,
}: {
  value: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${
        value ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}>
      <View className={`h-6 w-6 rounded-full bg-white ${value ? 'self-end' : 'self-start'}`} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();

  // Optimistic overlay: the pending patch sits on top of the server copy and is dropped once
  // the mutation settles, when the cache holds the authoritative answer.
  const [pending, setPending] = useState<Partial<UserSettings>>({});
  const [error, setError] = useState<string | null>(null);

  const settings = settingsQuery.data ? { ...settingsQuery.data, ...pending } : undefined;

  async function save(patch: Partial<UserSettings>) {
    setError(null);
    setPending((current) => ({ ...current, ...patch }));
    try {
      await updateSettings.mutateAsync(patch);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending((current) => {
        const next = { ...current };
        for (const key of Object.keys(patch) as (keyof UserSettings)[]) delete next[key];
        return next;
      });
    }
  }

  function change(key: keyof UserSettings, value: string | boolean) {
    selectFeedback();
    void save({ [key]: value });
  }

  if (settingsQuery.isPending) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader
          eyebrow="Settings"
          title="Preferences"
          subtitle="How Kova looks, reads and nudges you."
          back
          backFallback="/profile"
        />
        <View className="mt-6" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      </Screen>
    );
  }

  if (settingsQuery.isError && !settings) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader
          eyebrow="Settings"
          title="Preferences"
          subtitle="How Kova looks, reads and nudges you."
          back
          backFallback="/profile"
        />
        <ErrorState
          title="Could not load your settings"
          message={errorMessage(settingsQuery.error)}
          onRetry={() => void settingsQuery.refetch()}
        />
      </Screen>
    );
  }

  if (!settings) return null;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        eyebrow="Settings"
        title="Preferences"
        subtitle="How Kova looks, reads and nudges you."
        back
        backFallback="/profile"
      />

      {error ? (
        <View className="mt-5">
          <FormError message={error} />
        </View>
      ) : null}

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Appearance</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="Theme"
          options={THEME_OPTIONS}
          value={settings.theme}
          onChange={(value) => change('theme', value)}
        />
        <Text className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Saved to your account. Kova&apos;s own appearance still follows your device setting.
        </Text>
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Text</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="Font size"
          options={FONT_OPTIONS}
          value={settings.fontSize}
          onChange={(value) => change('fontSize', value)}
        />
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Layout</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="Density"
          options={LAYOUT_OPTIONS}
          value={settings.layout}
          onChange={(value) => change('layout', value)}
        />
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Notifications</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        <Row
          title="Reminders"
          subtitle="Due dates, focus blocks and daily nudges"
          icon="notifications-outline"
          tone="primary"
          right={
            <TogglePill
              value={settings.notificationsEnabled ?? false}
              onPress={() => change('notificationsEnabled', !(settings.notificationsEnabled ?? false))}
              label="Enable notifications"
            />
          }
        />
        <View className="px-4 pb-4">
          <ChipRow
            label="Style"
            options={STYLE_OPTIONS}
            value={settings.notificationStyle}
            onChange={(value) => change('notificationStyle', value)}
          />
        </View>
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Language</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="App language"
          options={LANGUAGE_OPTIONS}
          value={settings.language}
          onChange={(value) => change('language', value)}
        />
      </Card>

      <Text className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        These preferences are saved to your account, so they follow you to every device you sign in
        on.
      </Text>
    </Screen>
  );
}
