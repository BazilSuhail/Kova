import { useEffect, useRef, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { registerDevice } from '@/api/devices';
import { queryKeys } from '@/hooks/queries/keys';
import { useAuth } from '@/providers/auth-provider';

/**
 * Reminders are scheduled server side and delivered through Expo, so the app never builds a
 * local notification. This provider only does two things: hand the server a push token, and
 * keep the in-app notification list honest when something arrives.
 */
if (Platform.OS !== 'web') {
  // The notification module has no web implementation, so even registering a handler throws there.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function currentPushToken(): Promise<string | null> {
  // Simulators and the web cannot receive remote push.
  if (Platform.OS === 'web' || !Device.isDevice) return null;

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
      lightColor: '#7C3AED',
    });
  }

  // An Expo push token is scoped to an EAS project; without one there is nothing to register.
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
    // There is no push channel on the web, and the listener API throws instead of no-opping.
    if (Platform.OS === 'web') return;

    const received = Notifications.addNotificationReceivedListener(() => {
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    });

    const opened = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });

    return () => {
      received.remove();
      opened.remove();
    };
  }, [client]);

  useEffect(() => {
    // A signed-out app has nobody to register against, and the next account needs its own row.
    if (status !== 'authenticated') {
      lastToken.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await currentPushToken();
        if (cancelled || !token || token === lastToken.current) return;

        // One physical device is one row, so re-registering on every launch is the point:
        // it re-owns a token that used to belong to a different account.
        lastToken.current = token;
        await registerDevice({
          expoPushToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
        void client.invalidateQueries({ queryKey: queryKeys.devices });
      } catch {
        // Push is best effort. Permission refused, no EAS project, offline: the rest of the
        // app is unaffected, so this stays silent.
        lastToken.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, client]);

  return <>{children}</>;
}
