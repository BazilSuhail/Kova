import { request } from './client';
import {
  avatarListSchema,
  parseOrThrow,
  settingsSchema,
  userSchema,
  type AuthUser,
  type Avatar,
  type UserPreferences,
  type UserSettings,
} from './types';

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  profilePicture?: string;
  preferences?: UserPreferences;
  /** Server-hosted avatar id; the server writes the matching `profilePicture` path. */
  avatarId?: string;
};

/** `GET /api/users/profile` — the signed-in user, password excluded. */
export async function fetchProfile(): Promise<AuthUser> {
  const payload = await request<unknown>('/api/users/profile');
  return parseOrThrow(userSchema, payload, 'profile');
}

/** `PUT /api/users/profile` — any subset of the whitelisted fields. */
export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const payload = await request<unknown>('/api/users/profile', { method: 'PUT', body: input });
  return parseOrThrow(userSchema, payload, 'profile');
}

/** `GET /api/users/profile/settings` */
export async function fetchSettings(): Promise<UserSettings> {
  const payload = await request<unknown>('/api/users/profile/settings');
  return parseOrThrow(settingsSchema, payload, 'settings');
}

/** `PUT /api/users/profile/settings` — unknown keys are ignored, the answer is the merge. */
export async function updateSettings(input: Partial<UserSettings>): Promise<UserSettings> {
  const payload = await request<unknown>('/api/users/profile/settings', {
    method: 'PUT',
    body: input,
  });
  return parseOrThrow(settingsSchema, payload, 'settings');
}

/** `GET /api/users/avatars` — the hosted catalogue. The images themselves are public. */
export async function listAvatars(): Promise<Avatar[]> {
  const payload = await request<unknown>('/api/users/avatars', { auth: false });
  return parseOrThrow(avatarListSchema, payload, 'avatars').avatars;
}

/**
 * `DELETE /api/users/profile` — irreversible, and the server cascades every collection the
 * account owns. The caller must confirm before reaching this.
 */
export async function deleteAccount(): Promise<void> {
  await request<unknown>('/api/users/profile', { method: 'DELETE' });
}
