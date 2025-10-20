import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

const benefits: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'notifications-outline', title: 'Reminders that land on time', detail: 'Due dates and focus blocks' },
  { icon: 'flame-outline', title: 'Daily streak nudge', detail: 'One gentle prompt, never spam' },
  { icon: 'sparkles-outline', title: 'Recap when you finish', detail: 'A short summary of the day' },
];

/** One-time step after a new signup. Finishing it hands the shell back to the tabs. */
export function PermissionsScreen() {
  const colors = useThemeColors();
  const completePermissions = useAuthStore((state) => state.completePermissions);
  const [busy, setBusy] = useState(false);

  async function handleEnable() {
    setBusy(true);
    try {
      if (Platform.OS !== 'web') {
        // Loaded lazily so the web preview never touches the native module.
        const Notifications = await import('expo-notifications');
        await Notifications.requestPermissionsAsync();
      }
    } catch {
      // The prompt is unavailable (simulator, web, denied) — the app works without it.
    } finally {
      setBusy(false);
      completePermissions();
    }
  }

  return (
    <AuthScaffold
      title="Stay on track"
      subtitle="Kova can nudge you at the right moment. You can change this later in Profile.">
      <View style={{ gap: 12 }}>
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="flex-row items-center rounded-2xl">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
              <Ionicons name={benefit.icon} size={19} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {benefit.title}
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{benefit.detail}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Text className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Device registration for push arrives with the reminders work, so nothing is sent to the server yet.
      </Text>

      <View className="mt-6" style={{ gap: 10 }}>
        <Button label="Enable notifications" loading={busy} onPress={handleEnable} />
        <Button label="Not now" variant="secondary" onPress={completePermissions} />
      </View>
    </AuthScaffold>
  );
}
