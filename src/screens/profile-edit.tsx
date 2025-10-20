import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import type { AuthUser, UserPreferences } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/hooks/queries/account';
import { errorMessage } from '@/lib/errors';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

type Option = { value: string; label: string };

type FieldErrors = { name?: string; email?: string; form?: string };

const THEME_OPTIONS: Option[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
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
            onPress={() => {
              selectFeedback();
              onChange(option.value);
            }}
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

function CloseButton() {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Close"
      className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="close" size={20} color={colors.text} />
    </Pressable>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState<string | undefined>(user.preferences?.theme);
  const [fontSize, setFontSize] = useState<string | undefined>(user.preferences?.fontSize);
  const [layout, setLayout] = useState<string | undefined>(user.preferences?.layout);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.preferences?.notificationsEnabled ?? true,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const baseNotifications = user.preferences?.notificationsEnabled ?? true;
  const dirty =
    name.trim() !== user.name ||
    email.trim() !== user.email ||
    theme !== user.preferences?.theme ||
    fontSize !== user.preferences?.fontSize ||
    layout !== user.preferences?.layout ||
    notificationsEnabled !== baseNotifications;

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // The server has no rule here, so only obviously wrong input is caught before the trip.
    const nextErrors: FieldErrors = {};
    if (trimmedName.length < 2) nextErrors.name = 'Use at least 2 characters.';
    if (!trimmedEmail.includes('@')) nextErrors.email = 'Enter a valid email address.';

    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      return;
    }

    const patch: { name?: string; email?: string; preferences?: UserPreferences } = {};
    if (trimmedName !== user.name) patch.name = trimmedName;
    if (trimmedEmail !== user.email) patch.email = trimmedEmail;

    const preferencesChanged =
      theme !== user.preferences?.theme ||
      fontSize !== user.preferences?.fontSize ||
      layout !== user.preferences?.layout ||
      notificationsEnabled !== baseNotifications;

    if (preferencesChanged) {
      patch.preferences = {
        ...user.preferences,
        theme,
        fontSize,
        layout,
        notificationsEnabled,
      };
    }

    if (Object.keys(patch).length === 0) return;

    setErrors({});
    setSaving(true);
    try {
      await updateProfile.mutateAsync(patch);
      successFeedback();
      router.back();
    } catch (error) {
      setErrors({ form: errorMessage(error) });
      setSaving(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader
        eyebrow="Profile"
        title="Edit profile"
        subtitle="Update your details and defaults."
        right={<CloseButton />}
      />

      {errors.form ? (
        <View className="mt-5">
          <FormError message={errors.form} />
        </View>
      ) : null}

      <View className="mt-5">
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
        />
      </View>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Preferences</Text>
      </SectionHeading>

      <Card>
        <View className="mb-4">
          <ChipRow label="Theme" options={THEME_OPTIONS} value={theme} onChange={setTheme} />
          <Text className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Saved to your account. Kova&apos;s own light or dark look is handled by the theme toggle,
            so this is a separate per-account record.
          </Text>
        </View>

        <View className="mb-4">
          <ChipRow label="Font size" options={FONT_OPTIONS} value={fontSize} onChange={setFontSize} />
        </View>

        <ChipRow label="Layout" options={LAYOUT_OPTIONS} value={layout} onChange={setLayout} />
      </Card>

      <Card padded={false} className="mt-4 overflow-hidden rounded-2xl">
        <Row
          title="Notifications"
          subtitle={notificationsEnabled ? 'Daily reminders are on' : 'Daily reminders are off'}
          icon="notifications-outline"
          right={
            <TogglePill
              value={notificationsEnabled}
              onPress={() => {
                selectFeedback();
                setNotificationsEnabled((current) => !current);
              }}
              label="Enable notifications"
            />
          }
          last
        />
      </Card>

      {!dirty ? (
        <Text className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          No changes yet.
        </Text>
      ) : null}

      <View className="mt-3">
        <Button
          label="Save changes"
          loading={saving}
          disabled={!dirty}
          onPress={() => void handleSave()}
        />
      </View>
    </Screen>
  );
}

export default function ProfileEditScreen() {
  const profile = useProfile();

  if (profile.isPending) {
    return (
      <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader
          eyebrow="Profile"
          title="Edit profile"
          subtitle="Update your details and defaults."
          right={<CloseButton />}
        />
        <View className="mt-6" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
        </View>
      </Screen>
    );
  }

  if (profile.isError && !profile.data) {
    return (
      <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader
          eyebrow="Profile"
          title="Edit profile"
          subtitle="Update your details and defaults."
          right={<CloseButton />}
        />
        <ErrorState
          title="Could not load your profile"
          message={errorMessage(profile.error)}
          onRetry={() => void profile.refetch()}
        />
      </Screen>
    );
  }

  if (!profile.data) return null;

  // The form seeds its state from the profile on mount; a refetch mid-edit must not clobber it.
  return <ProfileForm key={profile.data.userId} user={profile.data} />;
}
