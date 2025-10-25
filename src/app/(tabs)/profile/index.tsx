import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router, type Href } from 'expo-router';

import { ThemePicker, THEME_OPTIONS } from '@/components/theme-picker';
import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDialog } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form-error';
import { Icon } from '@/components/ui/icon';
import { Row, type RowTone } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { assetUrl } from '@/config/env';
import { layout, spacing } from '@/config/theme';
import { useProfile, useProgress } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { initialsOf } from '@/lib/format';
import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/store/auth-store';
import type { IconName } from '@/theme/icons';

type MenuRow = {
  title: string;
  subtitle?: string;
  icon: IconName;
  onPress: () => void;
  tone?: RowTone;
};

const go = (href: Href) => () => router.push(href);

function MenuGroup({ rows, index }: { rows: MenuRow[]; index: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(220).delay(index * 40)} className="mt-4">
      <Card padded={false} className="overflow-hidden">
        {rows.map((row, i) => (
          <Row key={row.title} {...row} last={i === rows.length - 1} />
        ))}
      </Card>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const profile = useProfile();
  const progress = useProgress();
  const storeUser = useAuthStore((state) => state.user);
  const { themeChoice } = useTheme();
  const { confirm } = useDialog();

  const [themeOpen, setThemeOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) useAuthStore.getState().setUser(profile.data);
  }, [profile.data]);

  const user = profile.data ?? storeUser;
  const avatarUri = assetUrl(user?.profilePicture);
  const themeLabel = THEME_OPTIONS.find((option) => option.value === themeChoice)?.label;

  async function handleSignOut() {
    const ok = await confirm({
      title: 'Sign out?',
      message: 'You will need your email and password to get back in.',
      icon: 'log-out-outline',
      confirmLabel: 'Sign out',
    });
    if (!ok) return;

    setSignOutError(null);
    setSigningOut(true);
    try {
      await useAuthStore.getState().signOut();
    } catch (error) {
      setSignOutError(errorMessage(error));
      setSigningOut(false);
    }
  }

  const groups: MenuRow[][] = [
    [
      { title: 'Edit profile', subtitle: 'Name and email', icon: 'person-outline', onPress: go('/profile/edit') },
      { title: 'Avatars', subtitle: 'Pick your picture', icon: 'happy-outline', onPress: go('/profile/avatars') },
    ],
    [
      { title: 'Settings', subtitle: 'Text, layout, reminders, language', icon: 'settings-outline', onPress: go('/profile/settings') },
      { title: 'Theme', subtitle: themeLabel, icon: 'color-palette-outline', onPress: () => setThemeOpen(true) },
      { title: 'Notifications', subtitle: 'Your inbox', icon: 'notifications-outline', onPress: go('/notifications') },
    ],
    [
      { title: 'Devices', subtitle: 'Phones that get push', icon: 'phone-portrait-outline', onPress: go('/profile/devices') },
      { title: 'Sync', subtitle: 'Pull the latest from the server', icon: 'sync-outline', onPress: go('/profile/sync') },
      { title: 'Security', subtitle: 'Change password', icon: 'lock-closed-outline', onPress: go('/profile/security') },
    ],
    [
      { title: 'About', subtitle: 'Version and server', icon: 'information-circle-outline', onPress: go('/profile/about') },
      { title: 'Sign out', icon: 'log-out-outline', onPress: () => void handleSignOut() },
    ],
    [
      { title: 'Danger zone', subtitle: 'Delete your account', icon: 'warning-outline', tone: 'danger', onPress: go('/profile/danger') },
    ],
  ];

  return (
    <Screen scroll={false}>
      <AppBar title="You" brand={false} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(220)}>
          <Pressable
            onPress={go('/profile/edit')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            className="flex-row items-center rounded-lg py-3 active:bg-surface-alt"
            style={{ gap: spacing.lg }}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                accessibilityLabel="Your avatar"
                contentFit="cover"
                transition={200}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-brand">
                <Text className="text-2xl font-bold text-on-brand">{initialsOf(user?.name, 'K')}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text numberOfLines={1} className="text-xl font-bold text-heading">
                {user?.name ?? 'Kova user'}
              </Text>
              <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
                {user?.email ?? ''}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} tone="default" />
          </Pressable>
        </Animated.View>

        {profile.isError ? (
          <View className="mt-2">
            <FormError message={errorMessage(profile.error)} />
            <Button label="Try again" variant="secondary" size="sm" icon="refresh" onPress={() => void profile.refetch()} />
          </View>
        ) : null}

        {progress.data ? (
          <Animated.View
            entering={FadeInDown.duration(220).delay(40)}
            className="mt-2 flex-row"
            style={{ gap: spacing.md }}
          >
            <StatTile icon="checkmark-done" value={progress.data.totals.completedTasks} label="Tasks done" className="flex-1" />
            <StatTile icon="flame-outline" value={progress.data.streak.current} label="Day streak" className="flex-1" />
          </Animated.View>
        ) : null}

        {groups.map((rows, index) => (
          <MenuGroup key={rows[0]!.title} rows={rows} index={index + 2} />
        ))}

        {signingOut ? <Text className="mt-3 text-center text-xs text-muted">Signing out…</Text> : null}
        {signOutError ? (
          <View className="mt-3">
            <FormError message={signOutError} />
          </View>
        ) : null}
      </ScrollView>

      <ThemePicker visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </Screen>
  );
}
