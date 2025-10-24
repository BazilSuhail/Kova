import { Platform } from 'react-native';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_KEY = 'kova.accessToken';
const REFRESH_KEY = 'kova.refreshToken';

const isWeb = Platform.OS === 'web';

const webStore = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {}
  },
  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {}
  },
};

async function readItem(key: string): Promise<string | null> {
  if (isWeb) return webStore.get(key);
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(key);
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    webStore.set(key, value);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    webStore.remove(key);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async load(): Promise<TokenPair | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        readItem(ACCESS_KEY),
        readItem(REFRESH_KEY),
      ]);
      if (!accessToken || !refreshToken) return null;
      return { accessToken, refreshToken };
    } catch {
      return null;
    }
  },

  async save(pair: TokenPair): Promise<void> {
    await Promise.all([
      writeItem(ACCESS_KEY, pair.accessToken),
      writeItem(REFRESH_KEY, pair.refreshToken),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([removeItem(ACCESS_KEY), removeItem(REFRESH_KEY)]);
  },

  async accessToken(): Promise<string | null> {
    try {
      return await readItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
};
