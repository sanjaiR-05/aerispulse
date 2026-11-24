import { NextRequest } from 'next/server';

/**
 * Validates request origin against the host header to guard mutating API routes from Cross-Site Request Forgery (CSRF).
 *
 * @param request - Incoming Next.js HTTP request
 * @returns boolean - True if request origin matches host or is same-origin/internal
 *
 * @example
 * ```ts
 * if (!validateRequestOrigin(request)) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Direct same-origin navigation, non-browser clients, or internal service calls
    return true;
  }

  const host = request.headers.get('host') || request.nextUrl.host;
  if (!host) {
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Extracts client IP address with priority given to standard proxy headers.
 *
 * @param request - Incoming Next.js HTTP request
 * @returns string - Sanitized client IPv4/IPv6 address or default fallback
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return '127.0.0.1';
}

/**
 * Generates standard IETF-compliant rate limit response headers.
 *
 * @param limit - Maximum requests allowed per sliding window
 * @param remaining - Number of remaining requests in active window
 * @param resetTime - Epoch millisecond timestamp when the active window resets
 * @returns Record<string, string> - Headers object containing X-RateLimit-* directives
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  const now = Date.now();
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));
  const resetEpochSeconds = Math.ceil(resetTime / 1000);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': resetEpochSeconds.toString(),
    ...(remaining <= 0 ? { 'Retry-After': retryAfterSeconds.toString() } : {}),
  };
}
