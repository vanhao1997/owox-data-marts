import { trackEvent } from './data-layer';

interface SyncBucket {
  startedAt: number;
  attempts: number;
  failures: number;
}

const buckets = new Map<string, SyncBucket>();
const BUCKET_MS = 5 * 60 * 1000;

/** Emits an aggregate refresh rate without including response or credential data. */
export function recordWebSyncRefresh(
  projectId: string,
  resource: 'reports' | 'runs',
  failed: boolean
): void {
  const now = Date.now();
  const bucketStart = Math.floor(now / BUCKET_MS) * BUCKET_MS;
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.startedAt < bucketStart - BUCKET_MS) buckets.delete(bucketKey);
  }
  const key = `${projectId}:${resource}:${bucketStart}`;
  const bucket = buckets.get(key) ?? { startedAt: bucketStart, attempts: 0, failures: 0 };
  bucket.attempts += 1;
  if (failed) bucket.failures += 1;
  buckets.set(key, bucket);

  trackEvent({
    event: 'web_sync_error_rate',
    category: 'WebSync',
    action: resource,
    context: projectId,
    value: String(bucket.failures / bucket.attempts),
    details: JSON.stringify({
      failedRefreshes: bucket.failures,
      refreshAttempts: bucket.attempts,
      grain: 'project/resource/5m',
      timezone: 'UTC',
    }),
  });
}
