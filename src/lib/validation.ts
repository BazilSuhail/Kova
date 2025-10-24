import { z } from 'zod';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nameSchema = z.string().trim().min(1, 'Your name is required');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .regex(EMAIL_PATTERN, 'Enter a valid email address');

export const newPasswordSchema = z.string().min(8, 'Use at least 8 characters');

export const currentPasswordSchema = z.string().min(1, 'Password is required');

export function fieldError<T>(schema: z.ZodType<T>, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message ?? 'Invalid value';
}
