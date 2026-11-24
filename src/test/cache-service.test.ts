import { describe, it, expect, beforeEach } from 'vitest';
import { globalCache } from '@/services/cache-service';

describe('In-Memory Stale-While-Revalidate Cache Service', () => {
  beforeEach(() => {
    globalCache.clear();
  });

  it('stores and retrieves cached data before TTL expires', () => {
    globalCache.set('key1', { value: 'test' }, 5000);
    const cached = globalCache.get<{ value: string }>('key1');

    expect(cached).not.toBeNull();
    expect(cached?.data.value).toBe('test');
    expect(cached?.isStale).toBe(false);
  });

  it('returns null for nonexistent keys', () => {
    expect(globalCache.get('nonexistent')).toBeNull();
  });

  it('reports stale data after TTL passes but within 2x TTL window', async () => {
    globalCache.set('staleKey', { test: true }, 50); // 50ms TTL

    await new Promise((r) => setTimeout(r, 60));
    const cached = globalCache.get<{ test: boolean }>('staleKey');

    expect(cached).not.toBeNull();
    expect(cached?.data.test).toBe(true);
    expect(cached?.isStale).toBe(true);
  });

  it('evicts entries older than 2x TTL', async () => {
    globalCache.set('expiredKey', { test: true }, 30); // 30ms TTL

    await new Promise((r) => setTimeout(r, 75)); // > 2x TTL
    const cached = globalCache.get('expiredKey');

    expect(cached).toBeNull();
  });

  it('reports accurate cache size and clears properly', () => {
    expect(globalCache.size()).toBe(0);
    globalCache.set('a', 1);
    globalCache.set('b', 2);
    expect(globalCache.size()).toBe(2);

    globalCache.clear();
    expect(globalCache.size()).toBe(0);
  });
});
