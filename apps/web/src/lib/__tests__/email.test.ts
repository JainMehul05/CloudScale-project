import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateVerificationToken, consumeVerificationToken } from '../email';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    verificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateVerificationToken', () => {
    it('should create verification token with 24-hour expiry', async () => {
      const mockCreate = vi.mocked(prisma.verificationToken.create);
      mockCreate.mockResolvedValueOnce({
        identifier: 'test@example.com',
        token: 'abc123',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as never);

      const result = await generateVerificationToken('test@example.com');

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          identifier: 'test@example.com',
          token: expect.any(String),
          expires: expect.any(Date),
        },
      });
      expect(result.token).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.expires.getTime()).toBeGreaterThan(Date.now() + 23 * 60 * 60 * 1000);
    });

    it('should generate cryptographically secure token', async () => {
      const mockCreate = vi.mocked(prisma.verificationToken.create);
      mockCreate.mockResolvedValueOnce({
        identifier: 'test@example.com',
        token: 'abc123',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as never);

      const result1 = await generateVerificationToken('test@example.com');
      const result2 = await generateVerificationToken('test@example.com');

      expect(result1.token).not.toBe(result2.token);
      expect(result1.token.length).toBe(64); // 32 bytes = 64 hex chars
    });
  });

  describe('consumeVerificationToken', () => {
    it('should return token data for valid token', async () => {
      const mockFindUnique = vi.mocked(prisma.verificationToken.findUnique);
      const mockDelete = vi.mocked(prisma.verificationToken.delete);
      
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      mockFindUnique.mockResolvedValueOnce({
        identifier: 'test@example.com',
        token: 'valid-token',
        expires: futureDate,
      } as never);
      mockDelete.mockResolvedValueOnce({} as never);

      const result = await consumeVerificationToken('valid-token');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
      expect(result?.token).toBe('valid-token');
      expect(mockDelete).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
    });

    it('should return null for non-existent token', async () => {
      const mockFindUnique = vi.mocked(prisma.verificationToken.findUnique);
      mockFindUnique.mockResolvedValueOnce(null);

      const result = await consumeVerificationToken('non-existent');

      expect(result).toBeNull();
    });

    it('should return null and delete expired token', async () => {
      const mockFindUnique = vi.mocked(prisma.verificationToken.findUnique);
      const mockDelete = vi.mocked(prisma.verificationToken.delete);
      
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      mockFindUnique.mockResolvedValueOnce({
        identifier: 'test@example.com',
        token: 'expired-token',
        expires: pastDate,
      } as never);
      mockDelete.mockResolvedValueOnce({} as never);

      const result = await consumeVerificationToken('expired-token');

      expect(result).toBeNull();
      expect(mockDelete).toHaveBeenCalledWith({ where: { token: 'expired-token' } });
    });

    it('should not allow token reuse', async () => {
      const mockFindUnique = vi.mocked(prisma.verificationToken.findUnique);
      const mockDelete = vi.mocked(prisma.verificationToken.delete);
      
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      mockFindUnique
        .mockResolvedValueOnce({
          identifier: 'test@example.com',
          token: 'reusable-token',
          expires: futureDate,
        } as never)
        .mockResolvedValueOnce(null);
      mockDelete.mockResolvedValueOnce({} as never);

      // First consumption succeeds
      const result1 = await consumeVerificationToken('reusable-token');
      expect(result1).not.toBeNull();

      // Second consumption fails (token deleted)
      const result2 = await consumeVerificationToken('reusable-token');
      expect(result2).toBeNull();
    });
  });
});