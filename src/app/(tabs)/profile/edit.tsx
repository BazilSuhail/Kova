import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import type { AuthUser, UserSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipRow, type ChipOption } from '@/components/ui/chip-row';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { useProfile, useUpdateProfile, useUpdateSettings } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

type FieldErrors = { name?: string; email?: string; form?: string };

const THEME_OPTIONS: ChipOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
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

function CloseButton() {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Close"
      className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
    >
      <Ionicons name="close" size={20} color={colors.heading} />
    </Pressable>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();

  const prefs = user.preferences;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState<string | undefined>(prefs?.theme);
  const [fontSize, setFontSize] = useState<string | undefined>(prefs?.fontSize);
  const [layout, setLayout] = useState<string | undefined>(prefs?.layout);
  const [notificationStyle, setNotificationStyle] = useState<string | undefined>(
    prefs?.notificationStyle,
  );
  const [language, setLanguage] = useState<string | undefined>(prefs?.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    prefs?.notificationsEnabled ?? true,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const baseNotifications = prefs?.notificationsEnabled ?? true;

  const identityDirty = name.trim() !== user.name || email.trim() !== user.email;
  const settingsDirty =
    theme !== prefs?.theme ||
    fontSize !== prefs?.fontSize ||
    layout !== prefs?.layout ||
    notificationStyle !== prefs?.notificationStyle ||
    language !== prefs?.language ||
    notificationsEnabled !== baseNotifications;
  const dirty = identityDirty || settingsDirty;

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (trimmedName.length < 2) nextErrors.name = 'Use at least 2 characters.';
    if (!trimmedEmail.includes('@')) nextErrors.email = 'Enter a valid email address.';

    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      return;
    }

    const identity: { name?: string; email?: string } = {};
    if (trimmedName !== user.name) identity.name = trimmedName;
    if (trimmedEmail !== user.email) identity.email = trimmedEmail;

    const settings: Partial<UserSettings> = {};
    if (theme !== prefs?.theme) settings.theme = theme;
    if (fontSize !== prefs?.fontSize) settings.fontSize = fontSize;
    if (layout !== prefs?.layout) settings.layout = layout;
    if (notificationStyle !== prefs?.notificationStyle)
      settings.notificationStyle = notificationStyle;
    if (language !== prefs?.language) settings.language = language;
    if (notificationsEnabled !== baseNotifications)
      settings.notificationsEnabled = notificationsEnabled;

    if (Object.keys(identity).length === 0 && Object.keys(settings).length === 0) return;

    setErrors({});
    setSaving(true);
    try {
      if (Object.keys(identity).length > 0) await updateProfile.mutateAsync(identity);
      if (Object.keys(settings).length > 0) await updateSettings.mutateAsync(settings);
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
        icon="create-outline"
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
        <Text className="text-base font-bold text-heading">Preferences</Text>
      </SectionHeading>

      <Card>
        <View className="mb-4">
          <ChipRow
            feedback
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={setTheme}
          />
          <Text className="mt-3 text-xs text-muted">
            Saved to your account. Kova&apos;s own light or dark look is handled by the theme
            toggle, so this is a separate per-account record.
          </Text>
        </View>

        <View className="mb-4">
          <ChipRow
            feedback
            label="Font size"
            options={FONT_OPTIONS}
            value={fontSize}
            onChange={setFontSize}
          />
        </View>

        <View className="mb-4">
          <ChipRow
            feedback
            label="Layout"
            options={LAYOUT_OPTIONS}
            value={layout}
            onChange={setLayout}
          />
        </View>

        <View>
          <ChipRow
            feedback
            label="Notification style"
            options={STYLE_OPTIONS}
            value={notificationStyle}
            onChange={setNotificationStyle}
          />
        </View>
      </Card>

      <Card padded={false} className="mt-4 overflow-hidden rounded-2xl">
        <Row
          title="Notifications"
          subtitle={notificationsEnabled ? 'Daily reminders are on' : 'Daily reminders are off'}
          icon="notifications-outline"
          right={
            <Toggle
              value={notificationsEnabled}
              onChange={() => {
                selectFeedback();
                setNotificationsEnabled((current) => !current);
              }}
              accessibilityLabel="Enable notifications"
            />
          }
          last
        />
      </Card>

      <Card className="mt-4">
        <ChipRow
          feedback
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={setLanguage}
        />
      </Card>

      {!dirty ? <Text className="mt-3 text-center text-xs text-muted">No changes yet.</Text> : null}

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
          icon="create-outline"
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
          icon="create-outline"
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

  return <ProfileForm key={profile.data.userId} user={profile.data} />;
}
