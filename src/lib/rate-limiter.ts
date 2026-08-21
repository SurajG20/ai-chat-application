export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  reset(): void;
}

// In-memory sliding-window limiter: per process instance. Sufficient for a
// single-server deployment; swap for Redis (or similar) when scaling horizontally.
export function createRateLimiter({ max, windowMs }: RateLimitOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const timestamps = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);

      if (timestamps.length >= max) {
        const oldest = Math.min(...timestamps);
        const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
        hits.set(key, timestamps);
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return { allowed: true, remaining: max - timestamps.length, retryAfterSeconds: 0 };
    },

    reset(): void {
      hits.clear();
    },
  };
}
