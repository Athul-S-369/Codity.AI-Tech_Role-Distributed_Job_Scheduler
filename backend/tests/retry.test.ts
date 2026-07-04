import { describe, it, expect } from 'vitest';
import {
  RetryStrategy,
  calculateRetryDelay,
  shouldRetry,
} from '@codity/shared';

describe('Retry Logic', () => {
  const baseConfig = {
    strategy: RetryStrategy.EXPONENTIAL,
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 60_000,
    multiplier: 2,
  };

  it('calculates fixed delay', () => {
    const delay = calculateRetryDelay(2, {
      ...baseConfig,
      strategy: RetryStrategy.FIXED,
    });
    expect(delay).toBe(1000);
  });

  it('calculates linear backoff', () => {
    const delay = calculateRetryDelay(3, {
      ...baseConfig,
      strategy: RetryStrategy.LINEAR,
    });
    expect(delay).toBe(3000);
  });

  it('calculates exponential backoff', () => {
    expect(calculateRetryDelay(1, baseConfig)).toBe(1000);
    expect(calculateRetryDelay(2, baseConfig)).toBe(2000);
    expect(calculateRetryDelay(3, baseConfig)).toBe(4000);
  });

  it('respects max delay cap', () => {
    const delay = calculateRetryDelay(10, {
      ...baseConfig,
      maxDelayMs: 5000,
    });
    expect(delay).toBe(5000);
  });

  it('shouldRetry returns true when attempts remain', () => {
    expect(shouldRetry(1, 3)).toBe(true);
    expect(shouldRetry(2, 3)).toBe(true);
  });

  it('shouldRetry returns false when max attempts reached', () => {
    expect(shouldRetry(3, 3)).toBe(false);
  });
});
