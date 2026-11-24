import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  validateRequestOrigin,
  getClientIp,
  createRateLimitHeaders,
} from '@/services/security';

describe('Security Service Suite', () => {
  it('allows same-origin requests or requests without origin header', () => {
    const reqNoOrigin = new NextRequest('http://localhost:3000/api/action-plan');
    expect(validateRequestOrigin(reqNoOrigin)).toBe(true);

    const reqSameOrigin = new NextRequest('http://localhost:3000/api/action-plan', {
      headers: {
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
    });
    expect(validateRequestOrigin(reqSameOrigin)).toBe(true);
  });

  it('rejects cross-origin requests from foreign origins (CSRF protection)', () => {
    const reqCross = new NextRequest('http://localhost:3000/api/action-plan', {
      headers: {
        origin: 'https://evil-attacker.com',
        host: 'localhost:3000',
      },
    });
    expect(validateRequestOrigin(reqCross)).toBe(false);
  });

  it('handles invalid malformed origin URLs gracefully', () => {
    const reqInvalid = new NextRequest('http://localhost:3000/api/action-plan', {
      headers: {
        origin: 'not-a-valid-url',
        host: 'localhost:3000',
      },
    });
    expect(validateRequestOrigin(reqInvalid)).toBe(false);
  });

  it('extracts client IP from x-forwarded-for first IP', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
      },
    });
    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('extracts client IP from x-real-ip when x-forwarded-for is absent', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-real-ip': '198.51.100.42',
      },
    });
    expect(getClientIp(req)).toBe('198.51.100.42');
  });

  it('defaults to 127.0.0.1 when no proxy headers exist', () => {
    const req = new NextRequest('http://localhost:3000/api/test');
    expect(getClientIp(req)).toBe('127.0.0.1');
  });

  it('generates standard rate limit headers when requests remain', () => {
    const headers = createRateLimitHeaders(60, 45, Date.now() + 30_000);
    expect(headers['X-RateLimit-Limit']).toBe('60');
    expect(headers['X-RateLimit-Remaining']).toBe('45');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
    expect(headers['Retry-After']).toBeUndefined();
  });

  it('includes Retry-After header when rate limit is depleted', () => {
    const headers = createRateLimitHeaders(60, 0, Date.now() + 15_000);
    expect(headers['X-RateLimit-Limit']).toBe('60');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });
});
