import { request } from './client';
import { parseOrThrow, tokenPairSchema, userSchema, type AuthUser, type TokenPairPayload } from './types';

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/** `POST /api/auth/signup` — creates the account and returns a fresh token pair. */
export async function signup(input: SignupInput): Promise<TokenPairPayload> {
  const payload = await request<unknown>('/api/auth/signup', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return parseOrThrow(tokenPairSchema, payload, 'signup');
}

/** `POST /api/auth/login` — exchange credentials for a token pair. */
export async function login(input: LoginInput): Promise<TokenPairPayload> {
  const payload = await request<unknown>('/api/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return parseOrThrow(tokenPairSchema, payload, 'login');
}

/** `GET /api/auth/me` — the signed-in profile (never the password hash). */
export async function fetchMe(): Promise<AuthUser> {
  const payload = await request<unknown>('/api/auth/me');
  return parseOrThrow(userSchema, payload, 'profile');
}

/**
 * `POST /api/auth/logout` — blocklists the access token immediately and, when given,
 * the refresh token too. Safe to call twice.
 */
export async function logout(refreshToken?: string): Promise<void> {
  await request<{ message?: string }>('/api/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refresh_token: refreshToken } : {},
  });
}
