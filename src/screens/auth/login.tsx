import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { errorMessage, isApiError } from '@/lib/errors';
import { currentPasswordSchema, emailSchema, fieldError } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';
import type { AuthRoute } from './auth-flow';

type FieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export function LoginScreen({ onNavigate }: { onNavigate: (route: AuthRoute) => void }) {
  const colors = useThemeColors();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: FieldErrors = {
      email: fieldError(emailSchema, email),
      password: fieldError(currentPasswordSchema, password),
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      const message = errorMessage(error);
      // 401 means the credentials themselves were refused — show it on the password field.
      setErrors(isApiError(error) && error.status === 401 ? { password: message } : { form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      onBack={() => onNavigate('welcome')}
      footer={
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">New to Kova?</Text>
          <Pressable onPress={() => onNavigate('signup')} className="ml-1 active:opacity-70">
            <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">Create an account</Text>
          </Pressable>
        </View>
      }>
      {errors.form ? <FormError message={errors.form} /> : null}

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
        placeholder="Your password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <View className="mt-2">
        <PrimaryButton label="Sign in" loading={submitting} onPress={handleSubmit} />
      </View>

      <View className="mt-4 flex-row items-center justify-center">
        <Ionicons name="lock-closed-outline" size={13} color={colors.textMuted} />
        <Text className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
          Password reset is not available yet.
        </Text>
      </View>
    </AuthScaffold>
  );
}
