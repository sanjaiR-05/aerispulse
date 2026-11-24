/**
 * Internal tracking entry storing millisecond request timestamps for an IP.
 */
interface RateLimitEntry {
  timestamps: number[];
}

/**
 * Result structure returned by rate limit verification.
 */
export interface RateLimitCheckResult {
  /** Whether the request is permitted within the active sliding window */
  allowed: boolean;
  /** Remaining requests quota before hitting the threshold */
  remaining: number;
  /** Epoch millisecond timestamp when the active window resets */
  resetTime: number;
}

/**
 * Sliding-window in-memory IP rate limiter for API route protection against DoS / resource exhaustion.
 * Enforces strict per-IP request quotas within a sliding time window.
 *
 * @example
 * ```ts
 * const limiter = new SlidingWindowRateLimiter(60_000, 60);
 * const check = limiter.check('192.168.1.1');
 * if (!check.allowed) { ... }
 * ```
 */
export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private ipRecords = new Map<string, RateLimitEntry>();

  /**
   * Initializes a sliding window rate limiter instance.
   *
   * @param windowMs - Sliding window duration in milliseconds (defaults to 60,000ms = 1 min)
   * @param maxRequests - Maximum requests permitted per window per IP (defaults to 60)
   */
  constructor(windowMs: number = 60_000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Evaluates an incoming request from an IP address against the sliding window quota.
   *
   * @param ip - Client IP address string
   * @returns {RateLimitCheckResult} Assessment containing allowed status, remaining quota, and reset time
   */
  check(ip: string): RateLimitCheckResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.ipRecords.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.ipRecords.set(ip, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0] ?? now;
      const resetTime = oldest + this.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetTime: now + this.windowMs,
    };
  }

  /**
   * Clears all recorded IP request histories (primarily used in testing cycles).
   */
  reset(): void {
    this.ipRecords.clear();
  }
}

/**
 * Shared global sliding-window rate limiter instance (60 requests / minute).
 */
export const globalRateLimiter = new SlidingWindowRateLimiter(60_000, 60);
