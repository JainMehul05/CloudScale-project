import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export enum AuditAction {
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_FAILED = "REGISTER_FAILED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  LOGOUT = "LOGOUT",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",
  EMAIL_VERIFICATION_FAILED = "EMAIL_VERIFICATION_FAILED",
}

export interface AuditLogData {
  userId: string;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
  }
}

export async function getAuditLogs(
  userId: string,
  options?: { limit?: number; offset?: number; action?: AuditAction }
) {
  const { limit = 50, offset = 0, action } = options || {};
  return prisma.auditLog.findMany({
    where: {
      userId,
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}