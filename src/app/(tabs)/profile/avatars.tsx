import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import type { Avatar } from '@/lib/api';
import { IconButton } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { assetUrl } from '@/config/env';
import { Sheet } from '@/components/ui/sheet';
import { useAvatars, useProfile, useUpdateProfile, useUploadAvatar } from '@/lib/api';
import { extensionFor } from '@/lib/upload';
import { errorMessage } from '@/lib/errors';
import { selectFeedback, successFeedback } from '@/lib/haptics';

export default function AvatarsScreen() {
  const avatars = useAvatars();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [pickerOpen, setPickerOpen] = useState(false);

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

  async function upload(source: 'camera' | 'library') {
    setError(null);
    try {
      // Let the sheet's modal finish closing; iOS will not present the picker over a dismissing modal.
      await new Promise((resolve) => setTimeout(resolve, 300));
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'Kova needs camera access to take your photo.'
            : 'Kova needs access to your photos to pick one.',
        );
        return;
      }

      // Square crop + JPEG compression keeps uploads well under the 5 MB server limit.
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      };
      const picked =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = picked.canceled ? undefined : picked.assets[0];
      if (!asset) return;

      setBusyId('upload');
      await uploadAvatar.mutateAsync({
        uri: asset.uri,
        name: `avatar.${extensionFor(asset.mimeType, 'jpg')}`,
        type: asset.mimeType ?? 'image/jpeg',
      });
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

  const close = <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />;

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
        {items.map((avatar, index) => {
          const selected = current.length > 0 && avatar.url === current;
          return (
            <Animated.View
              key={avatar.id}
              entering={FadeInDown.duration(220).delay(Math.min(index, 12) * 30)}
              style={{ width: '25%' }}
              className="items-center pb-5"
            >
              <Pressable
                onPress={() => {
                  selectFeedback();
                  void choose(avatar);
                }}
                disabled={busyId !== null}
                accessibilityRole="button"
                accessibilityLabel={avatar.filename || 'Avatar'}
                accessibilityState={{ selected, disabled: busyId !== null }}
                className={`h-16 w-16 items-center justify-center rounded-full border-2 bg-surface active:opacity-70 ${
                  selected ? 'border-brand-ink' : 'border-transparent'
                }`}
              >
                <Image
                  source={{ uri: assetUrl(avatar.url) ?? avatar.url }}
                  contentFit="cover"
                  transition={200}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader
        title="Avatars"
        subtitle="Tap one to use it. It saves right away."
        right={close}
      />

      {error ? (
        <View className="mt-5">
          <FormError message={error} />
        </View>
      ) : null}

      <View className="mt-5">
        <Button
          label={busyId === 'upload' ? 'Uploading photo…' : 'Upload photo'}
          icon="camera-outline"
          loading={busyId === 'upload'}
          disabled={busyId !== null}
          onPress={() => setPickerOpen(true)}
        />
      </View>

      <View className="mt-5">{catalogue()}</View>

      <Button
        label="Use initials instead"
        variant="secondary"
        icon="trash-outline"
        loading={busyId === 'remove'}
        disabled={busyId !== null || current.length === 0}
        onPress={() => void remove()}
      />

      <Sheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Upload photo"
        subtitle="JPEG, PNG or WebP, up to 5 MB"
        icon="image-outline"
        actions={[
          { icon: 'camera-outline', label: 'Take photo', onPress: () => void upload('camera') },
          { icon: 'images-outline', label: 'Choose from library', onPress: () => void upload('library') },
        ]}
      />
    </Screen>
  );
}
