import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

/** "Alex Lee" → "AL"; falls back to a single letter for one-word names. */
function initialsOf(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : '';
  return `${first}${last}`.toUpperCase() || 'K';
}

const preferences: { label: string; detail: string; icon: IconName }[] = [
  { label: 'Notifications', detail: 'Daily reminders are on', icon: 'notifications' },
  { label: 'Focus goal', detail: '5 sessions per week', icon: 'locate' },
  { label: 'Sound', detail: 'Ambient sounds enabled', icon: 'volume-high' },
];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  function handleSignOut() {
    // RN Web has no button-capable Alert, so it signs out directly.
    if (Platform.OS === 'web') {
      void signOut();
      return;
    }
    Alert.alert('Sign out', 'You will need to sign in again to get back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader eyebrow="Profile" title="You" subtitle="Account, appearance and app details." />

      <Card className="mt-5 flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-violet-600">
          <Text className="text-xl font-bold text-white">{initialsOf(user?.name)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name ?? 'Kova user'}</Text>
          <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user?.email ?? 'Signed in'}</Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Ionicons name="pencil" size={16} color={colors.textMuted} />
        </View>
      </Card>

      <View className="mt-3 flex-row items-center rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <Ionicons name="trophy" size={20} color={colors.success} />
        <Text className="ml-3 flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          7-day streak, you are on a roll.
        </Text>
      </View>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Preferences</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        <Row title="Appearance" subtitle="Light / dark mode" icon="moon" right={<ThemeToggle />} />

        {preferences.map((preference, index) => (
          <Row
            key={preference.label}
            title={preference.label}
            subtitle={preference.detail}
            icon={preference.icon}
            last={index === preferences.length - 1}
          />
        ))}
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">App</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        <Row
          title="About Kova"
          subtitle="Version, support and credits"
          icon="information-circle"
          onPress={() => router.push('/profile/about')}
          last
        />
      </Card>

      <View className="mt-6">
        <Button label="Sign out" variant="danger" icon="log-out" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}
