import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadNotifications } from '@/lib/notifications';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const benefits: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: 'notifications-outline',
    title: 'Reminders that land on time',
    detail: 'Due dates and focus blocks',
  },
  { icon: 'flame-outline', title: 'Daily streak nudge', detail: 'One gentle prompt, never spam' },
  {
    icon: 'sparkles-outline',
    title: 'Recap when you finish',
    detail: 'A short summary of the day',
  },
];

export default function PermissionsScreen() {
  const colors = useThemeColors();
  const completePermissions = useAuthStore((state) => state.completePermissions);
  const [busy, setBusy] = useState(false);

  async function handleEnable() {
    setBusy(true);
    try {
      const Notifications = await loadNotifications();
      await Notifications?.requestPermissionsAsync();
    } catch {
    } finally {
      setBusy(false);
      completePermissions();
    }
  }

  return (
    <AuthScaffold
      title="Stay on track"
      subtitle="Kova can nudge you at the right moment. You can change this later in Profile."
    >
      <View style={{ gap: 12 }}>
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="flex-row items-center rounded-2xl">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt">
              <Ionicons name={benefit.icon} size={19} color={colors.brandInk} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-heading">{benefit.title}</Text>
              <Text className="mt-0.5 text-xs text-muted">{benefit.detail}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Text className="mt-6 text-xs text-muted">
        Reminders are scheduled on the server, so this device registers itself for push the first
        time it can get a token. You can remove it any time from Profile.
      </Text>

      <View className="mt-6" style={{ gap: 10 }}>
        <Button label="Enable notifications" loading={busy} onPress={handleEnable} />
        <Button label="Not now" variant="secondary" onPress={completePermissions} />
      </View>
    </AuthScaffold>
  );
}
