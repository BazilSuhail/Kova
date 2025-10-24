import { create } from 'zustand';

import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from '@/lib/api';
import type { AuthUser, TokenPairPayload } from '@/lib/api';
import { errorMessage, isAuthError } from '@/lib/errors';
import { queryClient } from '@/lib/query-client';
import { tokenStorage } from '@/lib/storage';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  showPermissions: boolean;
  restoreError: string | null;

  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forceSignOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  completePermissions: () => void;
  setUser: (user: AuthUser) => void;
};

async function startSession(
  payload: TokenPairPayload,
  set: (partial: Partial<AuthState>) => void,
  showPermissions: boolean,
): Promise<void> {
  await tokenStorage.save({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  });

  try {
    const user = await fetchMe();
    queryClient.clear();
    set({ status: 'authenticated', user, showPermissions, restoreError: null });
  } catch (error) {
    if (isAuthError(error)) await tokenStorage.clear();
    throw error;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  showPermissions: false,
  restoreError: null,

  async signUp(name, email, password) {
    const payload = await signupRequest({ name, email, password });
    await startSession(payload, set, true);
  },

  async signIn(email, password) {
    const payload = await loginRequest({ email, password });
    await startSession(payload, set, false);
  },

  async signOut() {
    const tokens = await tokenStorage.load();
    try {
      await logoutRequest(tokens?.refreshToken);
    } catch {}
    await tokenStorage.clear();
    queryClient.clear();
    set({ status: 'unauthenticated', user: null, showPermissions: false, restoreError: null });
  },

  async forceSignOut() {
    await tokenStorage.clear();
    queryClient.clear();
    set({ status: 'unauthenticated', user: null, showPermissions: false, restoreError: null });
  },

  async restoreSession() {
    set({ status: 'loading', restoreError: null });

    const tokens = await tokenStorage.load();
    if (!tokens) {
      set({ status: 'unauthenticated', user: null });
      return;
    }

    try {
      const user = await fetchMe();
      set({ status: 'authenticated', user, restoreError: null });
    } catch (error) {
      if (isAuthError(error)) {
        await tokenStorage.clear();
        set({ status: 'unauthenticated', user: null, restoreError: null });
        return;
      }
      set({ status: 'unauthenticated', user: null, restoreError: errorMessage(error) });
    }
  },

  completePermissions() {
    set({ showPermissions: false });
  },

  setUser(user) {
    set({ user });
  },
}));

let bootstrap: Promise<void> | null = null;

export function bootstrapSession(): Promise<void> {
  bootstrap ??= useAuthStore.getState().restoreSession();
  return bootstrap;
}

export function retrySession(): Promise<void> {
  bootstrap = useAuthStore.getState().restoreSession();
  return bootstrap;
}
