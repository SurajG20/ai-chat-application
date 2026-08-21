import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRateLimiter } from './rate-limiter';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });

    expect(limiter.check('user-1').allowed).toBe(true);
    expect(limiter.check('user-1').allowed).toBe(true);
    expect(limiter.check('user-1').allowed).toBe(true);
    expect(limiter.check('user-1').remaining).toBe(0);
  });

  it('blocks requests over the limit and reports retry time', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 });

    limiter.check('user-1');
    limiter.check('user-1');
    const result = limiter.check('user-1');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });

    expect(limiter.check('user-1').allowed).toBe(true);
    expect(limiter.check('user-2').allowed).toBe(true);
    expect(limiter.check('user-1').allowed).toBe(false);
  });

  it('allows requests again after the window elapses', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 5_000 });

    expect(limiter.check('user-1').allowed).toBe(true);
    expect(limiter.check('user-1').allowed).toBe(false);

    vi.advanceTimersByTime(5_001);

    expect(limiter.check('user-1').allowed).toBe(true);
  });

  it('reset clears all state', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });

    limiter.check('user-1');
    limiter.reset();

    expect(limiter.check('user-1').allowed).toBe(true);
  });
});
