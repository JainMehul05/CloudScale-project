import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, getClientIp, createRateLimitHeaders, RateLimitResult } from '../ratelimit';

vi.mock('ioredis', () => {
  const mockZRemRangeByScore = vi.fn().mockResolvedValue(0);
  const mockZCard = vi.fn().mockResolvedValue(0);
  const mockZAdd = vi.fn().mockResolvedValue(1);
  const mockExpire = vi.fn().mockResolvedValue(1);
  const mockZRange = vi.fn().mockResolvedValue([]);
  const mockConnect = vi.fn().mockResolvedValue(undefined);

  return {
    Redis: vi.fn().mockImplementation(() => ({
      status: 'ready',
      zremrangebyscore: mockZRemRangeByScore,
      zcard: mockZCard,
      zadd: mockZAdd,
      expire: mockExpire,
      zrange: mockZRange,
      connect: mockConnect,
    })),
  };
});

import { Redis } from 'ioredis';

type MockRedisInstance = InstanceType<typeof Redis>;

describe('Rate Limiting', () => {
  let mockRedis: MockRedisInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis = new Redis() as MockRedisInstance;
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: new Map([['x-forwarded-for', '192.168.1.1, 10.0.0.1']]),
        get: function(key: string) { return this.headers.get(key); }
      } as any;
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = {
        headers: new Map([['x-real-ip', '192.168.1.2']]),
        get: function(key: string) { return this.headers.get(key); }
      } as any;
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('should return unknown when no IP headers', () => {
      const request = {
        headers: new Map(),
        get: function(key: string) { return this.headers.get(key); }
      } as any;
      
      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow request under limit', async () => {
      const mockZCard = vi.mocked(mockRedis.zcard);
      mockZCard.mockResolvedValueOnce(0);

      const result = await checkRateLimit({
        key: 'test:key',
        limit: 5,
        windowMs: 60000,
      });

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it('should reject request over limit', async () => {
      const mockZCard = vi.mocked(mockRedis.zcard);
      mockZCard.mockResolvedValueOnce(5);

      const result = await checkRateLimit({
        key: 'test:key',
        limit: 5,
        windowMs: 60000,
      });

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterMs).toBeDefined();
    });

    it('should clean up expired entries', async () => {
      const mockZRemRangeByScore = vi.mocked(mockRedis.zremrangebyscore);
      
      await checkRateLimit({
        key: 'test:key',
        limit: 5,
        windowMs: 60000,
      });

      expect(mockZRemRangeByScore).toHaveBeenCalled();
    });

    it('should fail-open on Redis error', async () => {
      const mockZCard = vi.mocked(mockRedis.zcard);
      mockZCard.mockRejectedValueOnce(new Error('Redis connection failed'));

      const result = await checkRateLimit({
        key: 'test:key',
        limit: 5,
        windowMs: 60000,
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create standard rate limit headers', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 10,
        remaining: 5,
        resetMs: 60000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After when rate limited', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 10,
        remaining: 0,
        resetMs: 60000,
        retryAfterMs: 30000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['Retry-After']).toBe('30');
    });
  });
});