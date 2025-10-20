import { request } from './client';
import { parseOrThrow, syncPullSchema, syncPushSchema, type SyncPull, type SyncPush } from './types';

/** A pull that also rewrites the cache can take a while on a first sync. */
const SYNC_TIMEOUT_MS = 60_000;

/**
 * `POST /api/sync/pull` — every document changed since `since`, plus tombstones.
 *
 * Omitting `since` performs a full sync (`full: true`), which is what a fresh install does.
 */
export async function pullSync(since?: string): Promise<SyncPull> {
  const payload = await request<unknown>('/api/sync/pull', {
    method: 'POST',
    body: since ? { since } : {},
    timeoutMs: SYNC_TIMEOUT_MS,
  });
  return parseOrThrow(syncPullSchema, payload, 'sync');
}

/**
 * `POST /api/sync/push` — uploads offline upserts and deletions.
 *
 * Conflicts are last-write-wins by `updatedAt`; anything the server considers older comes
 * back in `skipped`.
 */
export async function pushSync(changes: Record<string, unknown>): Promise<SyncPush> {
  const payload = await request<unknown>('/api/sync/push', {
    method: 'POST',
    body: { changes },
    timeoutMs: SYNC_TIMEOUT_MS,
  });
  return parseOrThrow(syncPushSchema, payload, 'sync');
}
