// Lightweight in-memory SWR client cache to eliminate redundant remote DB round-trips
const CACHE_TTL_MS = 30_000; // 30 seconds fresh

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function getClientCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  return entry.data;
}

export function setClientCached<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function isClientCacheFresh(key: string, ttlMs = CACHE_TTL_MS): boolean {
  const entry = memoryCache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

export function invalidateClientCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k);
    }
  }
}
