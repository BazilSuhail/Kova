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

export function kindForStatus(status: number): ApiErrorKind {
  if (status === 400) return 'validation';
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'notFound';
  if (status === 413) return 'tooLarge';
  if (status === 415) return 'unsupported';
  if (status === 429) return 'rateLimit';
  if (status === 502 || status === 503) return 'providerDown';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function defaultMessageFor(kind: ApiErrorKind): string {
  switch (kind) {
    case 'network':
      return "Can't reach Kova right now. Check your connection and try again.";
    case 'timeout':
      return 'Kova took too long to respond. Try again.';
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

export function isAuthError(error: unknown): boolean {
  return isApiError(error) && error.kind === 'auth';
}

export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export function isRetryable(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return (
    error.kind === 'network' ||
    error.kind === 'timeout' ||
    error.kind === 'server' ||
    error.kind === 'providerDown'
  );
}

export function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.kind === 'network') return defaultMessageFor('network');
    return sanitizeMessage(error.message, defaultMessageFor(error.kind));
  }
  if (error instanceof Error) return sanitizeMessage(error.message, defaultMessageFor('unknown'));
  return defaultMessageFor('unknown');
}

/** Where a task came from, so error copy can speak about the right action. */
export type CaptureContext = 'task' | 'prompt' | 'photo' | 'voice' | 'ai';

/**
 * Messages are tuned per capture flow: a failed photo read should not read like a
 * failed manual save, and a dropped connection should never expose API settings.
 */
const CONTEXT_MESSAGES: Record<CaptureContext, Partial<Record<ApiErrorKind, string>>> = {
  task: {
    network: "You're offline, so this task wasn't saved. Your words are still here — try again when you're back online.",
    server: "Kova couldn't save that task. Nothing was lost — try again.",
  },
  prompt: {
    network:
      "You're offline, so Kova couldn't read that sentence. Your words are safe — try again when you're back online.",
    timeout: 'Kova took too long to understand that. Try a shorter sentence.',
    validation: "Kova couldn't turn that into a task. Try naming the action and a time.",
    providerDown: "Kova's writing helper is taking a break. Try again in a moment.",
    server: "Kova couldn't file that task. Your sentence is still here — try again.",
    unsupported: "Kova couldn't understand that wording. Try describing it another way.",
  },
  photo: {
    network:
      "You're offline, so the photo couldn't be read. It's still on your device — try again when you're back online.",
    timeout: 'Reading that photo took too long. Try again, or use a sharper, well-lit page.',
    tooLarge: 'That photo is too large to upload (16 MB max). Try a smaller image.',
    unsupported: "Kova couldn't read that file. Try a JPEG, PNG or HEIC photo.",
    validation: "Kova couldn't find readable notes in that photo. Try a clearer, straight-on shot.",
    providerDown: "Kova's reading helper is taking a break. Try again in a moment.",
    server: "Kova couldn't file the task from that photo. The photo is still here — try again.",
  },
  voice: {
    network:
      "You're offline, so the recording couldn't be transcribed. Try again when you're back online.",
    timeout: 'That recording took too long to transcribe. Try a shorter note.',
    tooLarge: 'That recording is too large to upload. Try a shorter note.',
    unsupported: "Kova couldn't read that audio format. Record it again.",
    validation: "Kova couldn't make out any words in that recording. Try again somewhere quieter.",
    providerDown: "Kova's listening helper is taking a break. Try again in a moment.",
    server: "Kova couldn't file the task from that recording. Nothing was lost — try again.",
  },
  ai: {
    network: "You're offline, so Kova couldn't help with that. Try again when you're back online.",
    timeout: 'That took too long. Try again with a shorter title or description.',
    providerDown: "Kova's helper is taking a break. Try again in a moment.",
    server: "Kova couldn't finish that. Try again.",
    validation: 'Add a little more detail first, then try again.',
  },
};

const TECHNICAL_PATTERN =
  /https?:\/\/|www\.|localhost|127\.0\.0\.1|10\.0\.2\.2|expo_public|\bapi\b|\burl\b|network request failed|failed to fetch|load failed|econn\w*|etimedout|socket|abort(?:ed)?|is not configured|unexpected token|<!doctype|<html/i;

function sanitizeMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  if (TECHNICAL_PATTERN.test(trimmed) || trimmed.length > 180) return fallback;
  return trimmed;
}

/** User-facing copy for the photo, voice, natural-language and AI flows. */
export function friendlyErrorMessage(error: unknown, context: CaptureContext): string {
  if (isApiError(error)) {
    if (error.kind === 'rateLimit') {
      return error.retryAfterSeconds
        ? `That was a lot of tries. Wait ${error.retryAfterSeconds}s and try again.`
        : 'That was a lot of tries. Wait a moment and try again.';
    }
    if (error.kind === 'auth') return defaultMessageFor('auth');

    if (error.kind === 'validation') {
      const clean = sanitizeMessage(error.message, '');
      if (clean) return clean;
    }

    return (
      CONTEXT_MESSAGES[context][error.kind] ??
      sanitizeMessage(error.message, defaultMessageFor(error.kind))
    );
  }

  if (error instanceof Error) {
    const clean = sanitizeMessage(error.message, '');
    if (clean) return clean;
  }

  return CONTEXT_MESSAGES[context].unknown ?? defaultMessageFor('unknown');
}
