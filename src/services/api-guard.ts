import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT } from '../domain/constants';
import { globalRateLimiter } from './rate-limiter';
import { createRateLimitHeaders, getClientIp, validateRequestOrigin } from './security';

/**
 * Outcome of a successful guard evaluation.
 */
export interface ApiGuardAllowed {
  allowed: true;
  /** Standard `X-RateLimit-*` headers to echo on the eventual response */
  rateLimitHeaders: Record<string, string>;
}

/**
 * Outcome of a rejected guard evaluation, carrying the ready-to-return response.
 */
export interface ApiGuardRejected {
  allowed: false;
  response: NextResponse;
}

/**
 * Discriminated union returned by {@link guardApiRequest}.
 */
export type ApiGuardOutcome = ApiGuardAllowed | ApiGuardRejected;

/**
 * Guard configuration for an individual route handler.
 */
export interface ApiGuardOptions {
  /**
   * When true, requests carrying a foreign `Origin` header are rejected with 403.
   * Mutating routes enable this; the idempotent telemetry read does not.
   */
  enforceSameOrigin?: boolean;
}

/**
 * Applies the shared cross-origin and sliding-window rate-limit policy to an API request.
 * Centralising this logic keeps every route handler consistent and free of duplicated guards.
 *
 * @param request - Incoming Next.js request
 * @param options - Guard configuration for the calling route
 * @returns {ApiGuardOutcome} `allowed: true` with headers, or `allowed: false` with a response
 *
 * @example
 * ```ts
 * const guard = guardApiRequest(request, { enforceSameOrigin: true });
 * if (!guard.allowed) return guard.response;
 * ```
 */
export function guardApiRequest(
  request: NextRequest,
  options: ApiGuardOptions = {}
): ApiGuardOutcome {
  if (options.enforceSameOrigin === true && !validateRequestOrigin(request)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'Cross-origin request rejected' },
        { status: 403 }
      ),
    };
  }

  const rateLimit = globalRateLimiter.check(getClientIp(request));
  const rateLimitHeaders = createRateLimitHeaders(
    RATE_LIMIT.maxRequests,
    rateLimit.remaining,
    rateLimit.resetTime
  );

  if (!rateLimit.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait before retrying.',
          resetTime: rateLimit.resetTime,
        },
        { status: 429, headers: rateLimitHeaders }
      ),
    };
  }

  return { allowed: true, rateLimitHeaders };
}
