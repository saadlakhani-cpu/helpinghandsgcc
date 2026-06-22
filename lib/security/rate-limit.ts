type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const store = globalThis as typeof globalThis & {
  __helpingHandsRateLimits?: Map<string, RateLimitBucket>;
};

function buckets() {
  if (!store.__helpingHandsRateLimits) {
    store.__helpingHandsRateLimits = new Map<string, RateLimitBucket>();
  }
  return store.__helpingHandsRateLimits;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const map = buckets();
  const bucket = map.get(key);

  if (!bucket || bucket.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { limited: false, retryAfter: 0 };
}
