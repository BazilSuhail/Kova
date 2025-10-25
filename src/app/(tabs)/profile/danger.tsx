import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDialog } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form-error';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { spacing } from '@/config/theme';
import { useDeleteAccount } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/auth-store';

const CONFIRMATION_WORD = 'DELETE';

export default function DangerZoneScreen() {
  const deleteAccount = useDeleteAccount();
  const { confirm } = useDialog();

  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const armed = confirmation.trim() === CONFIRMATION_WORD;

  async function handleDelete() {
    if (!armed) return;
    const ok = await confirm({
      title: 'Delete account?',
      message: 'Your account and everything in it is deleted right away. This cannot be undone.',
      icon: 'trash-outline',
      confirmLabel: 'Delete everything',
      destructive: true,
    });
    if (!ok) return;

    setError(null);
    try {
      await deleteAccount.mutateAsync();
      await useAuthStore.getState().forceSignOut();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  return (
    <Screen>
      <ScreenHeader
        icon="warning-outline"
        eyebrow="Danger zone"
        title="Delete account"
        subtitle="Permanent. Nothing comes back."
        back
        backFallback="/profile"
      />

      <Animated.View entering={FadeInDown.duration(220)}>
        <Card className="mt-4">
          <View className="flex-row items-center" style={{ gap: spacing.md }}>
            <View className="h-9 w-9 items-center justify-center rounded-md bg-danger">
              <Icon name="warning-outline" size={18} tone="danger" />
            </View>
            <Text className="flex-1 text-base font-semibold text-danger-ink">This is permanent</Text>
          </View>
          <Text className="mt-3 text-sm leading-6 text-body">
            Every task, plan, mood entry, reflection, summary, reminder and device on this account is
            removed immediately.
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(220).delay(40)}>
        <Card padded={false} className="mt-4 overflow-hidden">
          <Row
            icon="cloud-download-outline"
            title="Keep a copy first"
            subtitle="Run a full sync to pull everything to this device"
            onPress={() => router.push('/profile/sync')}
            last
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(220).delay(80)} className="mt-6">
        {error ? <FormError message={error} /> : null}
        <Input
          label={`Type ${CONFIRMATION_WORD} to confirm`}
          icon="create-outline"
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRMATION_WORD}
        />
        <Button
          label="Delete my account"
          variant="danger"
          icon="trash-outline"
          disabled={!armed}
          loading={deleteAccount.isPending}
          onPress={() => void handleDelete()}
        />
      </Animated.View>
    </Screen>
  );
}
