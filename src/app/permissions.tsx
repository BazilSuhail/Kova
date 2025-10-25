import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { spacing } from '@/config/theme';
import { loadNotifications } from '@/lib/notifications';
import { useAuthStore } from '@/store/auth-store';
import type { IconName } from '@/theme/icons';

const BENEFITS: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'alarm-outline', title: 'Reminders on time', detail: 'Due dates and focus blocks' },
  { icon: 'flame-outline', title: 'One daily nudge', detail: 'Keeps your streak alive, never spam' },
  { icon: 'sparkles-outline', title: 'End-of-day recap', detail: 'A short summary when you finish' },
];

export default function PermissionsScreen() {
  const completePermissions = useAuthStore((state) => state.completePermissions);
  const [busy, setBusy] = useState(false);

  async function handleEnable() {
    setBusy(true);
    try {
      const Notifications = await loadNotifications();
      await Notifications?.requestPermissionsAsync();
    } catch {
      // A refused or unsupported prompt still lets the user into the app.
    } finally {
      setBusy(false);
      completePermissions();
    }
  }

  return (
    <AuthScaffold
      title="Turn on notifications"
      subtitle="So Kova can nudge you at the right moment."
      illustration="plan"
    >
      <View style={{ gap: spacing.xl }}>
        {BENEFITS.map((benefit, index) => (
          <Animated.View
            key={benefit.title}
            entering={FadeInDown.duration(220).delay(80 + index * 40)}
            className="flex-row items-center"
            style={{ gap: spacing.lg }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-md bg-brand-soft">
              <Icon name={benefit.icon} size={20} tone="brand" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-heading">{benefit.title}</Text>
              <Text className="mt-0.5 text-sm text-muted">{benefit.detail}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={{ marginTop: spacing.xxxl, gap: spacing.sm }}>
        <Button
          label="Allow notifications"
          icon="notifications-outline"
          loading={busy}
          onPress={() => void handleEnable()}
        />
        <Button label="Not now" variant="ghost" onPress={completePermissions} />
        <Text className="mt-1 text-center text-xs text-muted">
          You can change this any time in You → Devices.
        </Text>
      </View>
    </AuthScaffold>
  );
}
