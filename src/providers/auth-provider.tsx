import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { setSessionExpiredHandler } from '@/api/client';
import type { AuthUser } from '@/api/types';
import { bootstrapSession, useAuthStore, type AuthStatus } from '@/store/auth-store';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  showPermissions: boolean;
  restoreError: string | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the session lifecycle: bootstraps it on launch and lets the API layer force a
 * sign-out the moment a rotated refresh token is refused.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const showPermissions = useAuthStore((state) => state.showPermissions);
  const restoreError = useAuthStore((state) => state.restoreError);
  const forceSignOut = useAuthStore((state) => state.forceSignOut);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void forceSignOut();
    });
    return () => setSessionExpiredHandler(null);
  }, [forceSignOut]);

  useEffect(() => {
    void bootstrapSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        showPermissions,
        restoreError,
        isAuthenticated: status === 'authenticated',
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
