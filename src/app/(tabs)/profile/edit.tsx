import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import type { AuthUser } from '@/lib/api';
import { IconButton } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { successFeedback } from '@/lib/haptics';
import { emailSchema, fieldError, nameSchema } from '@/lib/validation';

type FieldErrors = { name?: string; email?: string; form?: string };

function Header() {
  return (
    <ScreenHeader
      title="Edit profile"
      subtitle="How you appear in Kova."
      right={<IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />}
    />
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<FieldErrors>({});

  const dirty = name.trim() !== user.name || email.trim() !== user.email;

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {
      name: fieldError(nameSchema, trimmedName),
      email: fieldError(emailSchema, trimmedEmail),
    };
    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      return;
    }

    const patch: { name?: string; email?: string } = {};
    if (trimmedName !== user.name) patch.name = trimmedName;
    if (trimmedEmail !== user.email) patch.email = trimmedEmail;

    setErrors({});
    try {
      await updateProfile.mutateAsync(patch);
      successFeedback();
      router.back();
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    }
  }

  return (
    <Screen>
      <Header />

      <Animated.View entering={FadeInDown.duration(220)} className="mt-4">
        {errors.form ? <FormError message={errors.form} /> : null}
        <Input
          label="Name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <Input
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
      </Animated.View>

      <View className="mt-2">
        <Button
          label="Save changes"
          icon="checkmark"
          loading={updateProfile.isPending}
          disabled={!dirty}
          onPress={() => void handleSave()}
        />
      </View>
    </Screen>
  );
}

export default function ProfileEditScreen() {
  const profile = useProfile();

  if (profile.data) return <ProfileForm key={profile.data.userId} user={profile.data} />;

  return (
    <Screen>
      <Header />
      {profile.isError ? (
        <ErrorState
          title="Could not load your profile"
          message={errorMessage(profile.error)}
          onRetry={() => void profile.refetch()}
        />
      ) : (
        <View className="mt-6" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
        </View>
      )}
    </Screen>
  );
}
