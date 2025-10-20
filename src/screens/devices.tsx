import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { Device } from '@/api/types';
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
import { useDevices, useRegisterDevice, useUnregisterDevice } from '@/hooks/queries/account';
import { errorMessage } from '@/lib/errors';
import { relativeTime } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type PermissionState = 'granted' | 'denied' | 'undetermined';

const PERMISSION_STYLES: Record<
  PermissionState,
  { label: string; icon: IconName; box: string; text: string }
> = {
  granted: {
    label: 'Granted',
    icon: 'checkmark-circle',
    box: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  denied: {
    label: 'Denied',
    icon: 'close-circle',
    box: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
    text: 'text-red-600 dark:text-red-300',
  },
  undetermined: {
    label: 'Not asked',
    icon: 'help-circle-outline',
    box: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-300',
  },
};

/** Expo push tokens are scoped to an EAS project; both the manifest and the build config may hold it. */
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

/** Permission pill, sized like a `Chip` but colour-coded by state. */
function PermissionPill({ state, ready }: { state: PermissionState; ready: boolean }) {
  const colors = useThemeColors();

  if (!ready) {
    return (
      <View className="rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Checking…</Text>
      </View>
    );
  }

  const style = PERMISSION_STYLES[state];
  const tint =
    state === 'granted' ? colors.success : state === 'denied' ? colors.danger : colors.textMuted;

  return (
    <View
      className={`flex-row items-center rounded-full border px-3 py-1.5 ${style.box}`}
      style={{ gap: 6 }}>
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
  // The permission module has no web implementation, so the screen is settled there from the start.
  const [permissionReady, setPermissionReady] = useState(Platform.OS === 'web');
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // The token this install holds, so the matching row can say "(this device)".
  const [ownToken, setOwnToken] = useState<string | null>(null);

  const devices = devicesQuery.data ?? [];

  useEffect(() => {
    // Nothing to read on the web; the initial state already reflects that.
    if (Platform.OS === 'web') return;

    let cancelled = false;

    void (async () => {
      try {
        const status = await Notifications.getPermissionsAsync();
        if (cancelled) return;
        setPermission(permissionStateFor(status));

        const projectId = easProjectId();
        if (status.granted && projectId) {
          try {
            const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
            if (!cancelled) setOwnToken(token);
          } catch {
            // A simulator or a build without push support simply cannot be marked.
          }
        }
      } catch {
        // Native module unavailable; the pill stays on "Not asked".
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
      const status = await Notifications.requestPermissionsAsync();
      setPermission(permissionStateFor(status));
    } catch {
      // The prompt is unavailable (simulator, already answered); leave the state as it is.
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

    // RN Web has no button-capable Alert, so it removes straight away.
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
    if (device.expoPushToken) parts.push(`…${device.expoPushToken.slice(-6)}`);
    return parts.join(' · ') || 'Registered';
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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        <ScreenHeader
          eyebrow="Devices"
          title="Push reminders"
          subtitle="Reminders are scheduled on the server and delivered to the phones you register here."
          back
          backFallback="/profile"
        />

        <Card className="mt-5">
          <Text className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Kova schedules reminders and daily nudges on the server and delivers them through Expo.
            A phone has to be registered once before any of them can reach it.
          </Text>
        </Card>

        <SectionHeading>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">This device</Text>
        </SectionHeading>

        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Notification permission
            </Text>
            <PermissionPill state={permission} ready={permissionReady} />
          </View>

          <Text className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
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
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
            Registered devices
          </Text>
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
                    className="h-9 w-9 items-center justify-center rounded-full active:opacity-70">
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
