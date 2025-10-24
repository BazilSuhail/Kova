import { useEffect, useRef, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { registerDevice, queryKeys } from '@/lib/api';
import { loadNotifications, type NotificationsModule } from '@/lib/notifications';
import { useAuth } from '@/providers/auth-provider';
import { palette } from '@/config/theme';

async function currentPushToken(Notifications: NotificationsModule): Promise<string | null> {
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: palette.forest,
    });
  }

  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data || null;
}

export function PushProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const client = useQueryClient();

  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let received: { remove: () => void } | null = null;
    let opened: { remove: () => void } | null = null;

    void (async () => {
      const Notifications = await loadNotifications();
      if (cancelled || !Notifications) return;

      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        received = Notifications.addNotificationReceivedListener(() => {
          void client.invalidateQueries({ queryKey: queryKeys.notifications });
          void client.invalidateQueries({ queryKey: queryKeys.dashboard });
        });

        opened = Notifications.addNotificationResponseReceivedListener(() => {
          router.push('/notifications');
        });
      } catch {}
    })();

    return () => {
      cancelled = true;
      received?.remove();
      opened?.remove();
    };
  }, [client]);

  useEffect(() => {
    if (status !== 'authenticated') {
      lastToken.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const Notifications = await loadNotifications();
        if (cancelled || !Notifications) return;

        const token = await currentPushToken(Notifications);
        if (cancelled || !token || token === lastToken.current) return;

        lastToken.current = token;
        await registerDevice({
          expoPushToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
        void client.invalidateQueries({ queryKey: queryKeys.devices });
      } catch {
        lastToken.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, client]);

  return <>{children}</>;
}
