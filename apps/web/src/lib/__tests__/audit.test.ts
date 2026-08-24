import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAuditLog, getAuditLogs, AuditAction } from '../audit';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Audit Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should create audit log with all fields', async () => {
      const mockCreate = vi.mocked(prisma.auditLog.create);
      mockCreate.mockResolvedValueOnce({} as never);

      await createAuditLog({
        userId: 'user-123',
        action: AuditAction.LOGIN_SUCCESS,
        metadata: { ip: '192.168.1.1' },
        ipAddress: '192.168.1.1',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          action: AuditAction.LOGIN_SUCCESS,
          metadata: { ip: '192.168.1.1' },
          ipAddress: '192.168.1.1',
        },
      });
    });

    it('should create audit log without optional fields', async () => {
      const mockCreate = vi.mocked(prisma.auditLog.create);
      mockCreate.mockResolvedValueOnce({} as never);

      await createAuditLog({
        userId: 'user-123',
        action: AuditAction.LOGOUT,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          action: AuditAction.LOGOUT,
          metadata: undefined,
          ipAddress: undefined,
        },
      });
    });

    it('should not throw on database error', async () => {
      const mockCreate = vi.mocked(prisma.auditLog.create);
      mockCreate.mockRejectedValueOnce(new Error('Database error'));

      await expect(createAuditLog({
        userId: 'user-123',
        action: AuditAction.LOGIN_FAILED,
      })).resolves.not.toThrow();
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with default options', async () => {
      const mockLogs = [
        { id: '1', userId: 'user-123', action: AuditAction.LOGIN_SUCCESS, createdAt: new Date() },
        { id: '2', userId: 'user-123', action: AuditAction.LOGOUT, createdAt: new Date() },
      ];
      const mockFindMany = vi.mocked(prisma.auditLog.findMany);
      mockFindMany.mockResolvedValueOnce(mockLogs as never);

      const logs = await getAuditLogs('user-123');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(logs).toEqual(mockLogs);
    });

    it('should fetch audit logs with custom options', async () => {
      const mockFindMany = vi.mocked(prisma.auditLog.findMany);
      mockFindMany.mockResolvedValueOnce([] as never);

      await getAuditLogs('user-123', { limit: 10, offset: 5, action: AuditAction.LOGIN_FAILED });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', action: AuditAction.LOGIN_FAILED },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('AuditAction enum', () => {
    it('should have all required action types', () => {
      expect(AuditAction.REGISTER_SUCCESS).toBe('REGISTER_SUCCESS');
      expect(AuditAction.REGISTER_FAILED).toBe('REGISTER_FAILED');
      expect(AuditAction.LOGIN_SUCCESS).toBe('LOGIN_SUCCESS');
      expect(AuditAction.LOGIN_FAILED).toBe('LOGIN_FAILED');
      expect(AuditAction.ACCOUNT_LOCKED).toBe('ACCOUNT_LOCKED');
      expect(AuditAction.PASSWORD_CHANGED).toBe('PASSWORD_CHANGED');
      expect(AuditAction.LOGOUT).toBe('LOGOUT');
      expect(AuditAction.EMAIL_VERIFIED).toBe('EMAIL_VERIFIED');
      expect(AuditAction.EMAIL_VERIFICATION_FAILED).toBe('EMAIL_VERIFICATION_FAILED');
    });
  });
});