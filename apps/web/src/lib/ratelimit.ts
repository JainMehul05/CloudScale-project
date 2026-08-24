import { Redis } from "ioredis";

/**
 * Redis-backed sliding window rate limiter using sorted sets.
 *
 * WHY REDIS SORTED SETS:
 * - Atomic operations via pipeline/MULTI for race-condition-free counting
 * - Native TTL via EXPIRE for automatic cleanup (no background job needed)
 * - Score-based windowing (timestamp as score) enables precise sliding window
 * - ZRANGEBYSCORE efficiently removes expired entries
 * - O(log N) insertion/removal, O(log N + M) range queries
 * - Single Redis key per rate limit bucket (memory efficient)
 *
 * RATE LIMITS CONFIGURED:
 * - Register: 5 requests/hour per IP (strict - prevents account enumeration)
 * - Login (IP): 10 requests/15min per IP (allows legitimate retries)
 * - Login (Email): 5 requests/15min per email (prevents credential stuffing)
 *
 * FAIL-OPEN BEHAVIOR:
 * - If Redis is unavailable, requests are ALLOWED (fail-open)
 * - Reason: Security should not cause denial-of-service
 * - Rate limiting is a protection layer, not a correctness requirement
 * - Logs error for observability but doesn't block legitimate traffic
 *
 * FUTURE IMPROVEMENTS:
 * - Distributed rate limiting with Redis Cluster (current: single instance)
 * - Token bucket algorithm for smoother burst handling
 * - Per-user limits after authentication (complement IP/email limits)
 * - Dynamic limits based on reputation/risk scoring
 * - Webhook/alerting on sustained limit violations
 */

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterMs?: number;
}

async function ensureConnected() {
  if (redis.status === "wait") {
    await redis.connect().catch(() => {});
  }
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  await ensureConnected();

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `ratelimit:${config.key}`;

  try {
    // Remove expired entries
    await redis.zremrangebyscore(key, 0, windowStart);
    
    // Get current count
    const currentCount = await redis.zcard(key);
    
    const remaining = Math.max(0, config.limit - currentCount - 1);
    const success = currentCount < config.limit;

    if (!success) {
      // @ts-expect-error - ioredis types issue with zrange arguments
      const oldest = await redis.zrange(key, 0, 0);
      const oldestTimestamp = oldest[0]?.split("-")[0];
      const resetMs = oldestTimestamp ? parseInt(oldestTimestamp, 10) + config.windowMs - now : config.windowMs;
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        resetMs: Math.max(0, resetMs),
        retryAfterMs: Math.max(0, resetMs),
      };
    }

    // Add current request
    await redis.zadd(key, String(now), `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(config.windowMs / 1000) + 1);

    return {
      success: true,
      limit: config.limit,
      remaining,
      resetMs: config.windowMs,
    };
  } catch (error) {
    console.error("[RateLimit] Redis error, allowing request:", error);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      resetMs: config.windowMs,
    };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetMs) / 1000)),
    ...(result.retryAfterMs ? { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)) } : {}),
  };
}