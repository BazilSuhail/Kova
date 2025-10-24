import { useState } from 'react';
import { Text, View } from 'react-native';

import type { UserSettings } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { ChipRow, type ChipOption } from '@/components/ui/chip-row';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { useSettings, useUpdateSettings } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { selectFeedback } from '@/lib/haptics';

const THEME_OPTIONS: ChipOption[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const FONT_OPTIONS: ChipOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const LAYOUT_OPTIONS: ChipOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const STYLE_OPTIONS: ChipOption[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'standard', label: 'Standard' },
  { value: 'firm', label: 'Firm' },
];

const LANGUAGE_OPTIONS: ChipOption[] = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
];

export default function SettingsScreen() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();

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
          icon="settings-outline"
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
          icon="settings-outline"
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
        icon="settings-outline"
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
        <Text className="text-base font-bold text-heading">Appearance</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="Theme"
          options={THEME_OPTIONS}
          value={settings.theme}
          onChange={(value) => change('theme', value)}
        />
        <Text className="mt-3 text-xs text-muted">
          Saved to your account. Kova&apos;s own appearance still follows your device setting.
        </Text>
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-heading">Text</Text>
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
        <Text className="text-base font-bold text-heading">Layout</Text>
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
        <Text className="text-base font-bold text-heading">Notifications</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        <Row
          title="Reminders"
          subtitle="Due dates, focus blocks and daily nudges"
          icon="notifications-outline"
          tone="primary"
          right={
            <Toggle
              value={settings.notificationsEnabled ?? false}
              onChange={(next) => change('notificationsEnabled', next)}
              accessibilityLabel="Enable notifications"
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
        <Text className="text-base font-bold text-heading">Language</Text>
      </SectionHeading>

      <Card>
        <ChipRow
          label="App language"
          options={LANGUAGE_OPTIONS}
          value={settings.language}
          onChange={(value) => change('language', value)}
        />
      </Card>

      <Text className="mt-6 text-center text-xs text-muted">
        These preferences are saved to your account, so they follow you to every device you sign in
        on.
      </Text>
    </Screen>
  );
}
