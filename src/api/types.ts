import { z } from 'zod';

import { ApiError } from '@/lib/errors';

/**
 * Response DTOs.
 *
 * The server strips unknown keys, so these schemas only describe what the client actually
 * depends on. Every payload is validated before it reaches a screen — a shape change on the
 * backend surfaces as one clear error instead of a crash deep in the UI.
 */

export const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  userId: z.string().optional(),
});

export type TokenPairPayload = z.infer<typeof tokenPairSchema>;

/** `preferences` is free-form enough to tolerate fields this client does not know yet. */
export const userPreferencesSchema = z.object({
  theme: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  fontSize: z.string().optional(),
  layout: z.string().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const userSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  profilePicture: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
  createdAt: z.string().optional(),
});

export type AuthUser = z.infer<typeof userSchema>;

/** Validates a payload against a schema, or fails with a server-shaped `ApiError`. */
export function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown, what: string): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError({
      kind: 'server',
      message: `The server returned an unexpected ${what} response.`,
    });
  }
  return result.data;
}
