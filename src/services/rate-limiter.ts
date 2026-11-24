import { RATE_LIMIT } from '../domain/constants';

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
 * Records for IPs with no activity inside the current window are evicted once the tracking
 * table exceeds {@link RATE_LIMIT.maxTrackedIps}, keeping memory bounded under traffic bursts.
 *
 * @example
 * ```ts
 * const limiter = new SlidingWindowRateLimiter(60_000, 60);
 * const check = limiter.check('192.168.1.1');
 * if (!check.allowed) { ... }
 * ```
 */
export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxTrackedIps: number;
  private ipRecords = new Map<string, RateLimitEntry>();

  /**
   * Initializes a sliding window rate limiter instance.
   *
   * @param windowMs - Sliding window duration in milliseconds (defaults to 60,000ms = 1 min)
   * @param maxRequests - Maximum requests permitted per window per IP (defaults to 60)
   * @param maxTrackedIps - Maximum distinct IP records retained before pruning (defaults to 10,000)
   */
  constructor(
    windowMs: number = RATE_LIMIT.windowMs,
    maxRequests: number = RATE_LIMIT.maxRequests,
    maxTrackedIps: number = RATE_LIMIT.maxTrackedIps
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxTrackedIps = maxTrackedIps;
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

    if (this.ipRecords.size >= this.maxTrackedIps) {
      this.pruneExpired(windowStart);
    }

    const record = this.ipRecords.get(ip) ?? { timestamps: [] };
    this.ipRecords.set(ip, record);

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((timestamp) => timestamp > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0] ?? now;
      return {
        allowed: false,
        remaining: 0,
        resetTime: oldest + this.windowMs,
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
   * Drops every IP record whose requests have all aged out of the active window.
   *
   * @param windowStart - Epoch millisecond boundary of the active window
   */
  private pruneExpired(windowStart: number): void {
    for (const [ip, record] of this.ipRecords) {
      if (!record.timestamps.some((timestamp) => timestamp > windowStart)) {
        this.ipRecords.delete(ip);
      }
    }
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
export const globalRateLimiter = new SlidingWindowRateLimiter();
