import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { PasswordField } from '@/components/auth/password-field';
import { PasswordStrength } from '@/components/auth/password-strength';
import { TrustRow } from '@/components/auth/trust-row';
import { ValidMark } from '@/components/auth/valid-mark';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useThemeColors } from '@/config/theme';
import { errorMessage, isApiError } from '@/lib/errors';
import { emailSchema, fieldError, nameSchema, newPasswordSchema } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const signUp = useAuthStore((state) => state.signUp);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) =>
      prev[field] || prev.form ? { ...prev, [field]: undefined, form: undefined } : prev,
    );
  }

  async function handleSubmit() {
    Keyboard.dismiss();

    const nextErrors: FieldErrors = {
      name: fieldError(nameSchema, name),
      email: fieldError(emailSchema, email),
      password: fieldError(newPasswordSchema, password),
      confirmPassword: password === confirmPassword ? undefined : 'Passwords do not match',
    };

    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      setErrors(nextErrors);

      const firstInvalid = nextErrors.name
        ? nameRef
        : nextErrors.email
          ? emailRef
          : nextErrors.password
            ? passwordRef
            : confirmRef;
      firstInvalid.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (error) {
      const message = errorMessage(error);
      const onEmail = isApiError(error) && error.status === 400 && /email/i.test(message);
      setErrors(onEmail ? { email: message } : { form: message });
      if (onEmail) {
        emailRef.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Kova keeps your day, your moods and your progress in one place."
      onBack={() => router.back()}
      illustration="insights"
      footer={
        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-sm text-muted">Already have an account?</Text>
          <Pressable
            onPress={() => router.replace('/login')}
            className="ml-1 flex-row items-center active:opacity-70"
            style={{ gap: 4 }}
          >
            <Text className="text-sm font-semibold text-brand-ink">Sign in</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.brandInk} />
          </Pressable>
        </View>
      }
    >
      {errors.form ? <FormError message={errors.form} /> : null}

      <Input
        ref={nameRef}
        icon="person-outline"
        label="Name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          clearError('name');
        }}
        error={errors.name}
        trailing={<ValidMark show={!fieldError(nameSchema, name)} />}
        placeholder="Lorde"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <Input
        ref={emailRef}
        icon="mail-outline"
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearError('email');
        }}
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
        onChangeText={(value) => {
          setPassword(value);
          clearError('password');
          clearError('confirmPassword');
        }}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />

      <PasswordStrength password={password} />

      <PasswordField
        ref={confirmRef}
        icon="shield-checkmark-outline"
        label="Confirm password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearError('confirmPassword');
        }}
        error={errors.confirmPassword}
        placeholder="Repeat your password"
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <View className="mt-2">
        <Button
          label="Create account"
          icon="arrow-forward"
          loading={submitting}
          onPress={handleSubmit}
        />
      </View>

      <TrustRow />
    </AuthScaffold>
  );
}
