import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';

export type NotificationsModule = typeof ExpoNotifications;

let pending: Promise<NotificationsModule | null> | null = null;

function isUsable(module: NotificationsModule | null): module is NotificationsModule {
  return (
    typeof module?.setNotificationHandler === 'function' &&
    typeof module?.getPermissionsAsync === 'function' &&
    typeof module?.getExpoPushTokenAsync === 'function'
  );
}

export function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web' || Constants.expoGoConfig != null) return Promise.resolve(null);

  pending ??= import('expo-notifications')
    .then((module) => (isUsable(module) ? module : null))
    .catch(() => null);
  return pending;
}
