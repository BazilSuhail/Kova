import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { PasswordField } from '@/components/auth/password-field';
import { TrustRow } from '@/components/auth/trust-row';
import { ValidMark } from '@/components/auth/valid-mark';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useThemeColors } from '@/config/theme';
import { errorMessage, isApiError } from '@/lib/errors';
import { currentPasswordSchema, emailSchema, fieldError } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';

type FieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const signIn = useAuthStore((state) => state.signIn);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateEmail(value: string) {
    setEmail(value);
    setErrors((prev) =>
      prev.email || prev.form ? { ...prev, email: undefined, form: undefined } : prev,
    );
  }

  function updatePassword(value: string) {
    setPassword(value);
    setErrors((prev) =>
      prev.password || prev.form ? { ...prev, password: undefined, form: undefined } : prev,
    );
  }

  async function handleSubmit() {
    Keyboard.dismiss();

    const nextErrors: FieldErrors = {
      email: fieldError(emailSchema, email),
      password: fieldError(currentPasswordSchema, password),
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      (nextErrors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      const message = errorMessage(error);
      const unauthorized = isApiError(error) && error.status === 401;
      setErrors(unauthorized ? { password: message } : { form: message });
      if (unauthorized) {
        passwordRef.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      onBack={() => router.back()}
      illustration="focus"
      footer={
        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-sm text-muted">New to Kova?</Text>
          <Pressable
            onPress={() => router.replace('/signup')}
            className="ml-1 flex-row items-center active:opacity-70"
            style={{ gap: 4 }}
          >
            <Text className="text-sm font-semibold text-brand-ink">Create an account</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.brandInk} />
          </Pressable>
        </View>
      }
    >
      {errors.form ? <FormError message={errors.form} /> : null}

      <Input
        ref={emailRef}
        icon="mail-outline"
        label="Email"
        value={email}
        onChangeText={updateEmail}
        error={errors.email}
        trailing={<ValidMark show={!fieldError(emailSchema, email)} />}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <PasswordField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={updatePassword}
        error={errors.password}
        placeholder="Your password"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <Pressable
        onPress={() => router.push('/forgot-password')}
        accessibilityRole="link"
        hitSlop={8}
        className="-mt-1 mb-3 flex-row items-center self-end active:opacity-70"
        style={{ gap: 4 }}
      >
        <Ionicons name="key-outline" size={14} color={colors.brandInk} />
        <Text className="text-sm font-semibold text-brand-ink">Forgot password?</Text>
      </Pressable>

      <View className="mt-2">
        <Button
          label="Sign in"
          icon="arrow-forward"
          loading={submitting}
          onPress={handleSubmit}
        />
      </View>

      <TrustRow />
    </AuthScaffold>
  );
}
