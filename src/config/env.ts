import { Platform } from 'react-native';

function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://127.0.0.1:5000';
}

export const API_BASE = resolveBaseUrl();

export const API_BASE_IS_DEFAULT = !process.env.EXPO_PUBLIC_API_URL?.trim();

export function assetUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (/^(https?:|data:|file:|blob:|content:)/i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
