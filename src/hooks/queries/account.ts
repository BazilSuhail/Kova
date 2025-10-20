import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { changePassword } from '@/api/auth';
import {
  listDevices,
  registerDevice,
  unregisterDevice,
  type DevicePlatform,
} from '@/api/devices';
import {
  deleteAccount,
  fetchProfile,
  fetchSettings,
  listAvatars,
  updateProfile,
  updateSettings,
  type UpdateProfileInput,
} from '@/api/users';
import { pullSync } from '@/api/sync';
import type { AuthUser, UserSettings } from '@/api/types';
import { queryKeys } from './keys';
import { useAuthStore } from '@/store/auth-store';

/**
 * The signed-in profile.
 *
 * The auth store already holds a copy from `/api/auth/me`, but edits here are cheap and
 * authoritative, so the result is written back to the store too — every screen that greets
 * the user by name sees the new one immediately.
 */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<AuthUser> => {
      const profile = await fetchProfile();
      useAuthStore.getState().setUser(profile);
      return profile;
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (profile) => {
      client.setQueryData(queryKeys.profile, profile);
      // The avatar lives in `profilePicture`, so the catalogue highlight follows too.
      void client.invalidateQueries({ queryKey: queryKeys.avatars });
      useAuthStore.getState().setUser(profile);
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<UserSettings>) => updateSettings(input),
    onSuccess: (settings) => client.setQueryData(queryKeys.settings, settings),
  });
}

export function useAvatars() {
  return useQuery({
    queryKey: queryKeys.avatars,
    queryFn: listAvatars,
    // The catalogue ships with the server and does not change between releases.
    staleTime: 30 * 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => changePassword(input),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => deleteAccount(),
  });
}

export function useDevices() {
  return useQuery({
    queryKey: queryKeys.devices,
    queryFn: listDevices,
  });
}

export function useRegisterDevice() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { expoPushToken: string; platform: DevicePlatform }) =>
      registerDevice(input),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.devices }),
  });
}

export function useUnregisterDevice() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => unregisterDevice(deviceId),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.devices }),
  });
}

/**
 * `POST /api/sync/pull` — the server's view of everything, used as a repair tool.
 *
 * The app already refetches what it displays, so a pull is followed by dropping the caches
 * that overlap it rather than merging documents client side.
 */
export function useSyncPull() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (since?: string) => pullSync(since),
    onSuccess: () => client.invalidateQueries(),
  });
}
