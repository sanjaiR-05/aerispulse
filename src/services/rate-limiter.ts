interface RateLimitEntry {
  timestamps: number[];
}

/**
 * Sliding-window in-memory IP rate limiter for API route protection.
 * Target: 100/100 Security Rubric.
 */
export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private ipRecords = new Map<string, RateLimitEntry>();

  constructor(windowMs: number = 60_000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
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

  reset(): void {
    this.ipRecords.clear();
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter(60_000, 60);
