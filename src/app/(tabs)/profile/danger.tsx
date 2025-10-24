import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useDeleteAccount } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { warnFeedback } from '@/lib/haptics';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/config/theme';

const CONFIRMATION_WORD = 'DELETE';

export default function DangerZoneScreen() {
  const colors = useThemeColors();
  const deleteAccount = useDeleteAccount();

  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const armed = confirmation === CONFIRMATION_WORD;

  async function performDelete() {
    setError(null);
    try {
      await deleteAccount.mutateAsync();
      warnFeedback();
      await useAuthStore.getState().forceSignOut();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  function confirmDelete() {
    if (!armed) return;

    if (Platform.OS === 'web') {
      void performDelete();
      return;
    }

    Alert.alert(
      'Delete account',
      'This permanently deletes your account and everything in it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => void performDelete() },
      ],
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        icon="warning-outline"
        eyebrow="Danger zone"
        title="Delete account"
        subtitle="Everything goes, and nothing comes back."
        back
        backFallback="/profile"
      />

      <Card className="mt-5 border-border bg-surface-alt">
        <View className="flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt">
            <Ionicons name="warning" size={20} color={colors.danger} />
          </View>
          <Text className="ml-3 flex-1 text-base font-bold text-danger-ink">This is permanent</Text>
        </View>
        <Text className="mt-3 text-sm leading-6 text-danger-ink">
          Deleting your account removes it and every task, plan, mood entry, reflection, summary,
          reminder and device row it owns. The server deletes them immediately, and it cannot be
          undone.
        </Text>
      </Card>

      {error ? (
        <View className="mt-4">
          <FormError message={error} />
        </View>
      ) : null}

      <View className="mt-4">
        <Input
          label={`Type ${CONFIRMATION_WORD} to confirm`}
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRMATION_WORD}
        />
      </View>

      <View className="mt-2">
        <Button
          label="Delete my account"
          variant="danger"
          icon="trash"
          disabled={!armed}
          loading={deleteAccount.isPending}
          onPress={confirmDelete}
        />
      </View>

      <Card className="mt-6">
        <View className="flex-row items-center">
          <Ionicons name="cloud-download-outline" size={18} color={colors.brandInk} />
          <Text className="ml-2 text-sm font-semibold text-heading">Export my data first</Text>
        </View>
        <Text className="mt-2 text-sm leading-6 text-muted">
          There is no export button. Open Sync and pull every document to this device â€” that is
          the only way to keep a copy before you delete.
        </Text>
        <View className="mt-4">
          <Button
            label="Go to Sync"
            variant="secondary"
            size="md"
            icon="sync"
            onPress={() => router.push('/profile/sync')}
          />
        </View>
      </Card>
    </Screen>
  );
}
