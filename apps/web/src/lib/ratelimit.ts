import { Redis } from "ioredis";

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
      // @ts-ignore - ioredis types issue with zrange arguments
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