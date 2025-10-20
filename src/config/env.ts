import { Platform } from 'react-native';

/**
 * Where the Kova API lives.
 *
 * `EXPO_PUBLIC_API_URL` wins when set (see `.env.example`). Without it we fall back to a
 * per-platform local default, because `127.0.0.1` inside an Android emulator points at the
 * emulator itself, not the host machine.
 */
function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://127.0.0.1:5000';
}

/** Base URL without a trailing slash. Every request path starts with `/api`. */
export const API_BASE = resolveBaseUrl();

/** True when the base URL was not explicitly configured (useful for dev warnings). */
export const API_BASE_IS_DEFAULT = !process.env.EXPO_PUBLIC_API_URL?.trim();
