import { z } from 'zod';

/**
 * Form rules for the auth screens.
 *
 * The server enforces no password rule on signup (only `PUT /api/auth/password` requires 8),
 * so the minimum lives here and applies to both screens.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nameSchema = z.string().trim().min(1, 'Your name is required');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .regex(EMAIL_PATTERN, 'Enter a valid email address');

export const newPasswordSchema = z.string().min(8, 'Use at least 8 characters');

export const currentPasswordSchema = z.string().min(1, 'Password is required');

/** Runs a schema and returns the first message, or `undefined` when the value is fine. */
export function fieldError<T>(schema: z.ZodType<T>, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message ?? 'Invalid value';
}
