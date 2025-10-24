import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { Device } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDevices, useRegisterDevice, useUnregisterDevice } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { relativeTime } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { loadNotifications } from '@/lib/notifications';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type PermissionState = 'granted' | 'denied' | 'undetermined';

const PERMISSION_STYLES: Record<
  PermissionState,
  { label: string; icon: IconName; box: string; text: string }
> = {
  granted: {
    label: 'Granted',
    icon: 'checkmark-circle',
    box: 'border-border bg-surface-alt',
    text: 'text-brand-ink',
  },
  denied: {
    label: 'Denied',
    icon: 'close-circle',
    box: 'border-border bg-surface-alt',
    text: 'text-danger-ink',
  },
  undetermined: {
    label: 'Not asked',
    icon: 'help-circle-outline',
    box: 'border-border bg-surface',
    text: 'text-muted',
  },
};

function easProjectId(): string | undefined {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

function permissionStateFor(status: Notifications.NotificationPermissionsStatus): PermissionState {
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

function platformLabel(platform: string): string {
  if (!platform) return 'Unknown device';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function PermissionPill({ state, ready }: { state: PermissionState; ready: boolean }) {
  const colors = useThemeColors();

  if (!ready) {
    return (
      <View className="rounded-full border border-border bg-surface px-3 py-1.5">
        <Text className="text-xs font-semibold text-muted">Checkingâ€¦</Text>
      </View>
    );
  }

  const style = PERMISSION_STYLES[state];
  const tint =
    state === 'granted' ? colors.successInk : state === 'denied' ? colors.danger : colors.muted;

  return (
    <View
      className={`flex-row items-center rounded-full border px-3 py-1.5 ${style.box}`}
      style={{ gap: 6 }}
    >
      <Ionicons name={style.icon} size={13} color={tint} />
      <Text className={`text-xs font-semibold ${style.text}`}>{style.label}</Text>
    </View>
  );
}

export default function DevicesScreen() {
  const colors = useThemeColors();
  const devicesQuery = useDevices();
  const registerDevice = useRegisterDevice();
  const unregisterDevice = useUnregisterDevice();

  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [permissionReady, setPermissionReady] = useState(Platform.OS === 'web');
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [ownToken, setOwnToken] = useState<string | null>(null);

  const devices = devicesQuery.data ?? [];

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    void (async () => {
      try {
        const Notifications = await loadNotifications();
        if (cancelled) return;

        if (!Notifications) {
          setPermission('undetermined');
          return;
        }

        const status = await Notifications.getPermissionsAsync();
        if (cancelled) return;
        setPermission(permissionStateFor(status));

        const projectId = easProjectId();
        if (status.granted && projectId) {
          try {
            const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
            if (!cancelled) setOwnToken(token);
          } catch {}
        }
      } catch {
      } finally {
        if (!cancelled) setPermissionReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function askAgain() {
    if (Platform.OS === 'web') return;

    setPermissionBusy(true);
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

      const status = await Notifications.requestPermissionsAsync();
      setPermission(permissionStateFor(status));
    } catch {
    } finally {
      setPermissionBusy(false);
    }
  }

  async function registerThisDevice() {
    setFormError(null);

    if (Platform.OS === 'web') {
      setFormError('Push notifications are not available in the web build.');
      return;
    }

    const projectId = easProjectId();
    if (!projectId) {
      setFormError(
        'A development or production build with an EAS project id is required before this device can register.',
      );
      return;
    }

    try {
      const Notifications = await loadNotifications();
      if (!Notifications) {
        setFormError(
          'Push is unavailable in this build. Expo Go on Android has no push support, so use a development or preview build.',
        );
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await registerDevice.mutateAsync({
        expoPushToken: token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      });
      setOwnToken(token);
      successFeedback();
    } catch (failure) {
      setFormError(errorMessage(failure));
    }
  }

  function confirmRemove(device: Device) {
    function remove() {
      setFormError(null);
      warnFeedback();
      void unregisterDevice.mutateAsync(device.deviceId).catch((failure: unknown) => {
        setFormError(errorMessage(failure));
      });
    }

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Remove device', `Push will stop for ${platformLabel(device.platform)}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  }

  function deviceSubtitle(device: Device): string {
    const parts: string[] = [];
    const when = relativeTime(device.registeredAt ?? device.updatedAt);
    if (when) parts.push(when);
    if (device.expoPushToken) parts.push(`â€¦${device.expoPushToken.slice(-6)}`);
    return parts.join(' Â· ') || 'Registered';
  }

  return (
    <Screen scroll={false} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={devicesQuery.isRefetching}
            onRefresh={() => void devicesQuery.refetch()}
            tintColor={colors.brandInk}
            colors={[colors.brandInk]}
          />
        }
      >
        <ScreenHeader
          icon="phone-portrait-outline"
          eyebrow="Devices"
          title="Push reminders"
          subtitle="Reminders are scheduled on the server and delivered to the phones you register here."
          back
          backFallback="/profile"
        />

        <Card className="mt-5">
          <Text className="text-sm leading-6 text-muted">
            Kova schedules reminders and daily nudges on the server and delivers them through Expo.
            A phone has to be registered once before any of them can reach it.
          </Text>
        </Card>

        <SectionHeading>
          <Text className="text-base font-bold text-heading">This device</Text>
        </SectionHeading>

        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-heading">Notification permission</Text>
            <PermissionPill state={permission} ready={permissionReady} />
          </View>

          <Text className="mt-2 text-xs leading-5 text-muted">
            A push token can only be fetched from a development or production build that carries an
            EAS project id. Kova also attempts to register automatically on every launch.
          </Text>

          <View className="mt-4">
            <Button
              label="Ask again"
              variant="secondary"
              size="md"
              icon="refresh"
              loading={permissionBusy}
              onPress={() => void askAgain()}
            />
          </View>
        </Card>

        {formError ? (
          <View className="mt-4">
            <FormError message={formError} />
          </View>
        ) : null}

        <View className="mt-4">
          <Button
            label="Turn on push for this device"
            icon="notifications"
            loading={registerDevice.isPending}
            onPress={() => void registerThisDevice()}
          />
        </View>

        <SectionHeading>
          <Text className="text-base font-bold text-heading">Registered devices</Text>
        </SectionHeading>

        {devicesQuery.isPending ? (
          <View style={{ gap: 12 }}>
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </View>
        ) : devicesQuery.isError ? (
          <ErrorState
            title="Could not load your devices"
            message={errorMessage(devicesQuery.error)}
            onRetry={() => void devicesQuery.refetch()}
          />
        ) : devices.length === 0 ? (
          <Card>
            <EmptyState
              icon="phone-portrait-outline"
              title="No devices yet"
              description="Register this phone and it will show up here."
              className="py-6"
            />
          </Card>
        ) : (
          <Card padded={false} className="overflow-hidden rounded-2xl">
            {devices.map((device, index) => (
              <Row
                key={device.deviceId}
                title={`${platformLabel(device.platform)}${
                  ownToken && device.expoPushToken === ownToken ? ' (this device)' : ''
                }`}
                subtitle={deviceSubtitle(device)}
                icon={device.platform === 'ios' ? 'logo-apple' : 'logo-android'}
                right={
                  <Pressable
                    onPress={() => confirmRemove(device)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${platformLabel(device.platform)}`}
                    hitSlop={8}
                    className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                }
                last={index === devices.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
