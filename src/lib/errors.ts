/**
 * Every failure the API layer can produce, reduced to something the UI can act on.
 *
 * `kind` is what screens branch on; `message` is the server's own wording when it gives one,
 * so validation errors read exactly like the backend describes them.
 */
export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'auth'
  | 'validation'
  | 'notFound'
  | 'tooLarge'
  | 'unsupported'
  | 'rateLimit'
  | 'server'
  | 'providerDown'
  | 'unknown';

export type ApiErrorOptions = {
  message: string;
  status?: number;
  kind?: ApiErrorKind;
  requestId?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly requestId: string | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.kind = options.kind ?? 'unknown';
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

/** Maps an HTTP status to the behaviour the UI wants. */
export function kindForStatus(status: number): ApiErrorKind {
  if (status === 400) return 'validation';
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'notFound';
  if (status === 413) return 'tooLarge';
  if (status === 415) return 'unsupported';
  if (status === 429) return 'rateLimit';
  // 502 stands for "the AI provider answered with something unusable" on this API.
  if (status === 502 || status === 503) return 'providerDown';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Fallback wording when the server sends no `message` of its own. */
export function defaultMessageFor(kind: ApiErrorKind): string {
  switch (kind) {
    case 'network':
      return 'Cannot reach the Kova server. Check your connection and API URL.';
    case 'timeout':
      return 'The server took too long to respond. Try again.';
    case 'cancelled':
      return 'Request cancelled.';
    case 'auth':
      return 'Your session expired. Please sign in again.';
    case 'validation':
      return 'Please check the details you entered.';
    case 'notFound':
      return 'That item could not be found.';
    case 'tooLarge':
      return 'That file is too large. The limit is 16 MB.';
    case 'unsupported':
      return 'The server could not read that request.';
    case 'rateLimit':
      return 'Too many requests. Please wait a moment.';
    case 'providerDown':
      return 'The AI service is unavailable right now. Try again later.';
    case 'server':
      return 'Something went wrong on the server. Try again.';
    default:
      return 'Something went wrong. Try again.';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** True when the account must sign in again (token revoked, refresh dead). */
export function isAuthError(error: unknown): boolean {
  return isApiError(error) && error.kind === 'auth';
}

/** True when the server reports the resource as missing. */
export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

/** True when the server is throttling us; mirrors `Retry-After`. */
export function isRateLimit(error: unknown): boolean {
  return isApiError(error) && error.kind === 'rateLimit';
}

/** True when the AI provider or database is unavailable. */
export function isProviderDown(error: unknown): boolean {
  return isApiError(error) && error.kind === 'providerDown';
}

/** True when retrying the exact same request could plausibly succeed. */
export function isRetryable(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server' || error.kind === 'providerDown';
}

/** Best-effort human message for anything thrown in the app. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return defaultMessageFor('unknown');
}
