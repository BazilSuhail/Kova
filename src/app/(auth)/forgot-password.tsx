import { useRef, useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { PasswordField } from '@/components/auth/password-field';
import { PasswordStrength } from '@/components/auth/password-strength';
import { ValidMark } from '@/components/auth/valid-mark';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useRequestPasswordReset, useResetPassword } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { successFeedback } from '@/lib/haptics';
import { emailSchema, fieldError, newPasswordSchema } from '@/lib/validation';

type FieldErrors = {
  email?: string;
  code?: string;
  password?: string;
  form?: string;
};

const CODE_PATTERN = /^\d{6}$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { confirm } = useDialog();
  const requestReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();

  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [resent, setResent] = useState(false);

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) =>
      prev[field] || prev.form ? { ...prev, [field]: undefined, form: undefined } : prev,
    );
  }

  async function sendCode(isResend = false) {
    Keyboard.dismiss();
    const emailError = fieldError(emailSchema, email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setErrors({});
    try {
      await requestReset.mutateAsync(email.trim());
      setResent(isResend);
      setStep('reset');
      setTimeout(() => codeRef.current?.focus(), 300);
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    }
  }

  async function submitReset() {
    Keyboard.dismiss();
    const nextErrors: FieldErrors = {
      code: CODE_PATTERN.test(code.trim()) ? undefined : 'Enter the 6-digit code',
      password: fieldError(newPasswordSchema, password),
    };
    if (nextErrors.code || nextErrors.password) {
      setErrors(nextErrors);
      (nextErrors.code ? codeRef : passwordRef).current?.focus();
      return;
    }
    setErrors({});
    try {
      await resetPassword.mutateAsync({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
      successFeedback();
      await confirm({
        title: 'Password updated',
        message: 'You have been signed out everywhere. Sign in with your new password.',
        icon: 'checkmark-circle-outline',
        confirmLabel: 'Sign in',
        cancelLabel: null,
      });
      router.replace('/login');
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    }
  }

  if (step === 'email') {
    return (
      <AuthScaffold
        title="Reset your password"
        subtitle="Enter your account email and we will send you a 6-digit code."
        onBack={() => router.back()}
      >
        {errors.form ? <FormError message={errors.form} /> : null}

        <Input
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
          returnKeyType="send"
          onSubmitEditing={() => void sendCode()}
        />

        <View className="mt-2">
          <Button
            label="Send code"
            icon="paper-plane-outline"
            loading={requestReset.isPending}
            onPress={() => void sendCode()}
          />
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      title="Enter your code"
      subtitle={`If ${email.trim()} has a Kova account, a code is on its way. It expires in 15 minutes.`}
      onBack={() => {
        setErrors({});
        setStep('email');
      }}
      footer={
        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-sm text-muted">
            {resent ? 'Code sent again.' : 'No email?'}
          </Text>
          <Pressable
            onPress={() => void sendCode(true)}
            disabled={requestReset.isPending}
            accessibilityRole="button"
            className="ml-1 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-brand-ink">Resend code</Text>
          </Pressable>
        </View>
      }
    >
      {errors.form ? <FormError message={errors.form} /> : null}

      <Input
        ref={codeRef}
        icon="keypad-outline"
        label="Code"
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/\D/g, '').slice(0, 6));
          clearError('code');
        }}
        error={errors.code}
        trailing={<ValidMark show={CODE_PATTERN.test(code)} />}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <PasswordField
        ref={passwordRef}
        label="New password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearError('password');
        }}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={() => void submitReset()}
      />

      <PasswordStrength password={password} />

      <View className="mt-2">
        <Button
          label="Reset password"
          icon="checkmark"
          loading={resetPassword.isPending}
          onPress={() => void submitReset()}
        />
      </View>
    </AuthScaffold>
  );
}
