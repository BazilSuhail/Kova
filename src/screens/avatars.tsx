import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import type { Avatar } from '@/api/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { assetUrl } from '@/config/env';
import { useAvatars, useProfile, useUpdateProfile } from '@/hooks/queries/account';
import { errorMessage } from '@/lib/errors';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

export default function AvatarsScreen() {
  const colors = useThemeColors();
  const avatars = useAvatars();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = profile.data?.profilePicture ?? '';

  async function choose(avatar: Avatar) {
    setError(null);
    setBusyId(avatar.id);
    try {
      await updateProfile.mutateAsync({ avatarId: avatar.id });
      successFeedback();
      router.back();
    } catch (failure) {
      setError(errorMessage(failure));
      setBusyId(null);
    }
  }

  async function remove() {
    setError(null);
    setBusyId('remove');
    try {
      await updateProfile.mutateAsync({ profilePicture: '' });
      successFeedback();
      router.back();
    } catch (failure) {
      setError(errorMessage(failure));
      setBusyId(null);
    }
  }

  const close = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Close"
      className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="close" size={20} color={colors.text} />
    </Pressable>
  );

  function catalogue() {
    if (avatars.isPending) {
      return (
        <View className="flex-row flex-wrap">
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} style={{ width: '25%' }} className="items-center pb-5">
              <Skeleton width={64} height={64} radius={32} />
            </View>
          ))}
        </View>
      );
    }

    if (avatars.isError) {
      return (
        <ErrorState
          title="Could not load avatars"
          message={errorMessage(avatars.error)}
          onRetry={() => void avatars.refetch()}
        />
      );
    }

    const items = avatars.data ?? [];
    if (items.length === 0) {
      return (
        <EmptyState
          icon="happy-outline"
          title="No avatars available"
          description="The catalogue is empty right now. Check back later."
        />
      );
    }

    return (
      <View className="flex-row flex-wrap">
        {items.map((avatar) => {
          const selected = current.length > 0 && avatar.url === current;
          return (
            <View key={avatar.id} style={{ width: '25%' }} className="items-center pb-5">
              <Pressable
                onPress={() => {
                  selectFeedback();
                  void choose(avatar);
                }}
                disabled={busyId !== null}
                accessibilityRole="button"
                accessibilityLabel={avatar.filename || 'Avatar'}
                accessibilityState={{ selected, disabled: busyId !== null }}
                className={`h-16 w-16 items-center justify-center rounded-full border-2 bg-white active:opacity-70 dark:bg-slate-900 ${
                  selected ? 'border-violet-600' : 'border-transparent'
                }`}>
                <Image
                  source={{ uri: assetUrl(avatar.url) ?? avatar.url }}
                  contentFit="cover"
                  transition={200}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader
        eyebrow="Profile"
        title="Choose an avatar"
        subtitle="Pick the face Kova shows next to your name."
        right={close}
      />

      {error ? (
        <View className="mt-5">
          <FormError message={error} />
        </View>
      ) : null}

      <View className="mt-5">{catalogue()}</View>

      <Button
        label="Remove my avatar"
        variant="secondary"
        icon="trash-outline"
        loading={busyId === 'remove'}
        disabled={busyId !== null || current.length === 0}
        onPress={() => void remove()}
      />

      <Text className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Your choice saves straight away and follows you to every device.
      </Text>
    </Screen>
  );
}
