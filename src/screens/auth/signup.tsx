import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { errorMessage, isApiError } from '@/lib/errors';
import { emailSchema, fieldError, nameSchema, newPasswordSchema } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';
import type { AuthRoute } from './auth-flow';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export function SignupScreen({ onNavigate }: { onNavigate: (route: AuthRoute) => void }) {
  const signUp = useAuthStore((state) => state.signUp);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: FieldErrors = {
      name: fieldError(nameSchema, name),
      email: fieldError(emailSchema, email),
      password: fieldError(newPasswordSchema, password),
      confirmPassword: password === confirmPassword ? undefined : 'Passwords do not match',
    };

    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (error) {
      const message = errorMessage(error);
      // The server reports duplicate accounts as a 400 on the email.
      const onEmail = isApiError(error) && error.status === 400 && /email/i.test(message);
      setErrors(onEmail ? { email: message } : { form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Kova keeps your day, your moods and your progress in one place."
      onBack={() => onNavigate('welcome')}
      footer={
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">Already have an account?</Text>
          <Pressable onPress={() => onNavigate('login')} className="ml-1 active:opacity-70">
            <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">Sign in</Text>
          </Pressable>
        </View>
      }>
      {errors.form ? <FormError message={errors.form} /> : null}

      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Lorde"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="At least 8 characters"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />

      <TextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        placeholder="Repeat your password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <View className="mt-2">
        <PrimaryButton label="Create account" loading={submitting} onPress={handleSubmit} />
      </View>
    </AuthScaffold>
  );
}
