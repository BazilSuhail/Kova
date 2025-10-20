import { API_BASE } from '@/config/env';
import { parseOrThrow, tokenPairSchema } from '@/api/types';
import { ApiError, defaultMessageFor, kindForStatus } from '@/lib/errors';
import { tokenStorage, type TokenPair } from '@/lib/storage';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
  method?: HttpMethod;
  /** JSON body. Ignored when `form` is set. */
  body?: unknown;
  /** Query params; `undefined`, `null` and `''` are dropped. */
  query?: Record<string, QueryValue>;
  /** Multipart body. `Content-Type` is left to fetch so the boundary stays valid. */
  form?: FormData;
  /** Send the bearer token. Defaults to `true`. */
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
};

const DEFAULT_TIMEOUT_MS = 20_000;
const REFRESH_PATH = '/api/auth/refresh';

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler | null = null;

/** Lets the auth store react when a rotated refresh token is refused. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler;
}

/**
 * Single-flight refresh: if five requests 401 at once they all await the same rotation,
 * because the server revokes the presented refresh token the moment it is exchanged.
 */
let refreshInFlight: Promise<TokenPair | null> | null = null;

async function refreshTokens(): Promise<TokenPair | null> {
  if (refreshInFlight) return refreshInFlight;

  const task = (async (): Promise<TokenPair | null> => {
    const current = await tokenStorage.load();
    if (!current) return null;

    try {
      const response = await fetch(`${API_BASE}${REFRESH_PATH}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      if (!response.ok) return null;

      const payload = parseOrThrow(tokenPairSchema, await response.json(), 'token refresh');
      const next: TokenPair = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      };
      // Rotation: the presented refresh token is dead now, so always keep the new pair.
      await tokenStorage.save(next);
      return next;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  refreshInFlight = task;
  return task;
}

/** Performs a request, refreshing the session once if the access token has expired. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return send<T>(path, options, false);
}

async function send<T>(path: string, options: RequestOptions, retried: boolean): Promise<T> {
  const requiresAuth = options.auth ?? true;
  const tokens = requiresAuth ? await tokenStorage.load() : null;

  const { response, requestId } = await performFetch(path, options, tokens);

  if (response.status === 401 && requiresAuth && !retried && tokens?.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) return send<T>(path, options, true);

    await tokenStorage.clear();
    onSessionExpired?.();
    throw new ApiError({
      status: 401,
      kind: 'auth',
      requestId,
      message: defaultMessageFor('auth'),
    });
  }

  return readBody<T>(response, requestId);
}

async function performFetch(
  path: string,
  options: RequestOptions,
  tokens: TokenPair | null,
): Promise<{ response: Response; requestId: string | undefined }> {
  const url = buildUrl(path, options.query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  let body: string | FormData | undefined;

  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      signal: controller.signal,
      ...(body === undefined ? {} : { body }),
    });
    logResponse(path, options.method ?? 'GET', response);
    return { response, requestId: response.headers.get('X-Request-ID') ?? undefined };
  } catch (error) {
    if (options.signal?.aborted) {
      throw new ApiError({ kind: 'cancelled', message: defaultMessageFor('cancelled'), cause: error });
    }
    if (controller.signal.aborted) {
      throw new ApiError({ kind: 'timeout', message: defaultMessageFor('timeout'), cause: error });
    }
    throw new ApiError({ kind: 'network', message: defaultMessageFor('network'), cause: error });
  } finally {
    clearTimeout(timer);
  }
}

async function readBody<T>(response: Response, requestId: string | undefined): Promise<T> {
  if (!response.ok) throw await toApiError(response, requestId);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text.trim()) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError({
      status: response.status,
      kind: 'server',
      requestId,
      message: 'The server returned a response the app could not read.',
    });
  }
}

async function toApiError(response: Response, requestId: string | undefined): Promise<ApiError> {
  const kind = kindForStatus(response.status);
  let message = defaultMessageFor(kind);

  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      message = payload.message;
    }
  } catch {
    // Non-JSON failure body (proxy page, gateway HTML) — keep the default wording.
  }

  const retryAfterSeconds = Number.parseInt(response.headers.get('Retry-After') ?? '', 10);

  return new ApiError({
    status: response.status,
    kind,
    message,
    requestId,
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
  });
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return base;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function logResponse(path: string, method: string, response: Response): void {
  if (!__DEV__) return;
  const timing = response.headers.get('Server-Timing');
  const requestId = response.headers.get('X-Request-ID');
  if (!timing && !requestId) return;
  console.log(
    `[api] ${method} ${path} -> ${response.status}`,
    timing ?? '',
    requestId ? `req=${requestId}` : '',
  );
}

/* ── List helpers ── */

export type Paginated<T> = {
  items: T[];
  page: number | null;
  limit: number | null;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ListEnvelope<T> = {
  items?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
};

/**
 * Normalises the API's two list shapes: a bare array when no paging params are sent,
 * or an `{ items, pagination }` envelope when they are.
 */
export function unwrapList<T>(payload: T[] | ListEnvelope<T>): Paginated<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: null,
      limit: null,
      total: payload.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };
  }

  const items = payload.items ?? [];
  const pagination = payload.pagination ?? {};
  return {
    items,
    page: pagination.page ?? 1,
    limit: pagination.limit ?? null,
    total: pagination.total ?? items.length,
    totalPages: pagination.totalPages ?? 1,
    hasNext: pagination.hasNext ?? false,
    hasPrev: pagination.hasPrev ?? false,
  };
}
