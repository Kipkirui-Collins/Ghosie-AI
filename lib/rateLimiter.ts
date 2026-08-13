import { getRedisClient } from "./redis";

const RATE_LIMIT = 60; // requests per minute
const WINDOW = 60; // seconds

/**
 * Check rate limit using Redis with token bucket algorithm
 * @param key - Rate limit key (e.g., user ID, IP address)
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(key: string): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    if (!redis) return true; // Redis unavailable - allow request (graceful degradation)

    const rateKey = `ratelimit:${key}`;

    // Get current token count
    const current = await redis.incr(rateKey);

    // Set expiry on first request
    if (current === 1) {
      await redis.expire(rateKey, WINDOW);
    }

    return current <= RATE_LIMIT;
  } catch (error) {
    // If Redis is down, allow the request (graceful degradation)
    console.warn("Rate limiter error, allowing request:", error);
    return true;
  }
}

/**
 * Get remaining tokens for a key
 */
export async function getRateLimitRemaining(key: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (!redis) return RATE_LIMIT;

    const rateKey = `ratelimit:${key}`;
    const current = await redis.get(rateKey);
    const count = current ? parseInt(current) : 0;
    return Math.max(0, RATE_LIMIT - count);
  } catch (error) {
    return RATE_LIMIT;
  }
}
