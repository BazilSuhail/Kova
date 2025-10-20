import { create } from 'zustand';

import { fetchMe, login as loginRequest, logout as logoutRequest, signup as signupRequest } from '@/api/auth';
import type { AuthUser, TokenPairPayload } from '@/api/types';
import { errorMessage, isAuthError } from '@/lib/errors';
import { queryClient } from '@/lib/query-client';
import { tokenStorage } from '@/lib/storage';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Set after a fresh signup so the flow can ask for notification permission once. */
  showPermissions: boolean;
  /** Set when a session restore could not reach the server. */
  restoreError: string | null;

  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Drops the session locally without a server round trip. */
  forceSignOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  completePermissions: () => void;
  setUser: (user: AuthUser) => void;
};

/**
 * Stores the rotated pair, then loads the profile.
 *
 * If the profile call fails the tokens are only removed when the server says they are
 * invalid — a network blip should not cost the user their session.
 */
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
      // Best effort: revokes the access token (and the refresh token) server side.
      await logoutRequest(tokens?.refreshToken);
    } catch {
      // Already expired or revoked — local cleanup is what matters.
    }
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
      // Server unreachable: the tokens stay put so a retry can recover the session.
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

/** Restores the session once per launch, no matter how many components ask for it. */
export function bootstrapSession(): Promise<void> {
  bootstrap ??= useAuthStore.getState().restoreSession();
  return bootstrap;
}

/** Retries a failed restore (used by the Welcome screen when the server was unreachable). */
export function retrySession(): Promise<void> {
  bootstrap = useAuthStore.getState().restoreSession();
  return bootstrap;
}
