import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Row, type RowTone } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { assetUrl } from '@/config/env';
import { useProfile } from '@/hooks/queries/account';
import { useProgress } from '@/hooks/queries/insights';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type MenuRow = {
  title: string;
  subtitle: string;
  icon: IconName;
  href: Href;
  tone?: RowTone;
};

const ACCOUNT_ROWS: MenuRow[] = [
  {
    title: 'Edit profile',
    subtitle: 'Name, email and preferences',
    icon: 'person-outline',
    href: '/profile/edit',
    tone: 'primary',
  },
  {
    title: 'Choose an avatar',
    subtitle: 'Pick from the Kova catalogue',
    icon: 'happy-outline',
    href: '/profile/avatars',
  },
  {
    title: 'Settings',
    subtitle: 'Appearance, notifications and language',
    icon: 'options-outline',
    href: '/profile/settings',
  },
];

const APP_ROWS: MenuRow[] = [
  {
    title: 'Notifications',
    subtitle: 'Reminders, recaps and nudges',
    icon: 'notifications-outline',
    href: '/notifications',
  },
  {
    title: 'Registered devices',
    subtitle: 'Where Kova can send push alerts',
    icon: 'phone-portrait-outline',
    href: '/profile/devices',
  },
  {
    title: 'Sync and storage',
    subtitle: 'Keep this account current everywhere',
    icon: 'cloud-upload-outline',
    href: '/profile/sync',
  },
  {
    title: 'Change password',
    subtitle: 'Update the password on this account',
    icon: 'lock-closed-outline',
    href: '/profile/security',
  },
];

const MORE_ROWS: MenuRow[] = [
  {
    title: 'About Kova',
    subtitle: 'Version, support and credits',
    icon: 'information-circle-outline',
    href: '/profile/about',
  },
  {
    title: 'Delete account',
    subtitle: 'Permanently remove your data',
    icon: 'trash-outline',
    href: '/profile/danger',
    tone: 'danger',
  },
];

/** "Alex Lee" → "AL"; falls back to a single letter for one-word names. */
function initialsOf(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : '';
  return `${first}${last}`.toUpperCase() || 'K';
}

/** `null` rather than "Invalid Date" when the server sends something unparseable. */
function memberSince(createdAt: string | undefined): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `Member since ${date.toLocaleDateString()}`;
}

function MenuGroup({ rows }: { rows: MenuRow[] }) {
  return (
    <Card padded={false} className="overflow-hidden rounded-2xl">
      {rows.map((row, index) => (
        <Row
          key={row.title}
          title={row.title}
          subtitle={row.subtitle}
          icon={row.icon}
          tone={row.tone}
          onPress={() => router.push(row.href)}
          last={index === rows.length - 1}
        />
      ))}
    </Card>
  );
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: number;
  label: string;
  tone: 'success' | 'primary';
}) {
  const colors = useThemeColors();
  const success = tone === 'success';

  return (
    <View className="flex-1 items-center">
      <View
        className={`h-9 w-9 items-center justify-center rounded-xl ${
          success ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-violet-50 dark:bg-violet-950'
        }`}>
        <Ionicons name={icon} size={17} color={success ? colors.success : colors.primary} />
      </View>
      <Text className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</Text>
      <Text className="text-xs text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const profile = useProfile();
  const progress = useProgress();
  const storeUser = useAuthStore((state) => state.user);

  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // The store copy is written on every profile fetch, so the header never flickers empty.
  const user = profile.data ?? storeUser;
  const since = memberSince(user?.createdAt);
  // `profilePicture` is a server-relative path, not a URL the image loader can resolve.
  const avatarUri = assetUrl(user?.profilePicture);

  async function performSignOut() {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await useAuthStore.getState().signOut();
    } catch (error) {
      setSignOutError(errorMessage(error));
    } finally {
      setSigningOut(false);
    }
  }

  function handleSignOut() {
    // RN Web has no button-capable Alert, so it signs out directly.
    if (Platform.OS === 'web') {
      void performSignOut();
      return;
    }
    Alert.alert('Sign out', 'You will need to sign in again to get back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void performSignOut() },
    ]);
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader eyebrow="Profile" title="You" subtitle="Account, appearance and app details." />

      <Card className="mt-5 flex-row items-center">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            accessibilityLabel={user?.name ? `${user.name}'s avatar` : 'Your avatar'}
            contentFit="cover"
            transition={200}
            style={{ width: 64, height: 64, borderRadius: 24 }}
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-full bg-violet-600">
            <Text className="text-2xl font-bold text-white">{initialsOf(user?.name)}</Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {user?.name ?? 'Kova user'}
          </Text>
          <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {user?.email ?? 'Signed in'}
          </Text>
          {since ? (
            <Text className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{since}</Text>
          ) : null}
        </View>
      </Card>

      {profile.isError ? (
        <View className="mt-4">
          <FormError message={errorMessage(profile.error)} />
          <Button
            label="Try again"
            variant="secondary"
            size="sm"
            icon="refresh"
            onPress={() => void profile.refetch()}
          />
        </View>
      ) : null}

      {progress.data ? (
        <Card className="mt-4 flex-row items-center">
          <Stat
            icon="checkmark-done"
            value={progress.data.totals.completedTasks}
            label="tasks done"
            tone="success"
          />
          <Stat icon="flame" value={progress.data.streak.current} label="day streak" tone="success" />
          <Stat
            icon="happy-outline"
            value={progress.data.totals.moodEntries}
            label="mood entries"
            tone="primary"
          />
        </Card>
      ) : null}

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Account</Text>
      </SectionHeading>
      <MenuGroup rows={ACCOUNT_ROWS} />

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">App</Text>
      </SectionHeading>
      <MenuGroup rows={APP_ROWS} />

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">More</Text>
      </SectionHeading>
      <MenuGroup rows={MORE_ROWS} />

      <View className="mt-6">
        {signOutError ? <FormError message={signOutError} /> : null}
        <Button
          label="Sign out"
          variant="secondary"
          icon="log-out-outline"
          loading={signingOut}
          onPress={handleSignOut}
        />
      </View>
    </Screen>
  );
}
