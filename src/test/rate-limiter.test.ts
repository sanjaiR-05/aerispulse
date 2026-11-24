import { describe, it, expect, beforeEach } from 'vitest';
import { SlidingWindowRateLimiter } from '@/services/rate-limiter';

describe('Sliding-Window In-Memory Rate Limiter', () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter(1000, 3); // 3 requests per 1000ms
  });

  it('allows requests below the limit', () => {
    const res1 = limiter.check('192.168.1.1');
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check('192.168.1.1');
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check('192.168.1.1');
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests exceeding the threshold', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');

    const blocked = limiter.check('192.168.1.1');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetTime).toBeGreaterThan(Date.now());
  });

  it('isolates different IP addresses independently', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');

    const otherIp = limiter.check('192.168.1.2');
    expect(otherIp.allowed).toBe(true);
    expect(otherIp.remaining).toBe(2);
  });

  it('resets correctly on reset() call', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    expect(limiter.check('192.168.1.1').allowed).toBe(false);

    limiter.reset();
    expect(limiter.check('192.168.1.1').allowed).toBe(true);
  });
});
