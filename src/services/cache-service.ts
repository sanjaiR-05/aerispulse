interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

/**
 * In-memory TTL cache with Stale-While-Revalidate semantics.
 * Keeps upstream latency < 50ms on cache hits.
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const age = Date.now() - entry.cachedAt;
    const isStale = age > entry.ttlMs;

    // Retain stale items for up to 2x TTL for graceful degradation
    if (age > entry.ttlMs * 2) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      isStale,
    };
  }

  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const globalCache = new MemoryCache();
