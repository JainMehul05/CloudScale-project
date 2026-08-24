import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export enum ActivityAction {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_ARCHIVED = "PROJECT_ARCHIVED",
  DEPLOYMENT_STARTED = "DEPLOYMENT_STARTED",
  DEPLOYMENT_SUCCESS = "DEPLOYMENT_SUCCESS",
  DEPLOYMENT_FAILED = "DEPLOYMENT_FAILED",
  DEPLOYMENT_STOPPED = "DEPLOYMENT_STOPPED",
  DEPLOYMENT_RESTARTED = "DEPLOYMENT_RESTARTED",
  DEPLOYMENT_DELETED = "DEPLOYMENT_DELETED",
  ENVIRONMENT_CREATED = "ENVIRONMENT_CREATED",
  ENVIRONMENT_UPDATED = "ENVIRONMENT_UPDATED",
  ENVIRONMENT_DELETED = "ENVIRONMENT_DELETED",
}

export interface ActivityLogData {
  userId: string;
  action: ActivityAction;
  metadata?: Prisma.InputJsonValue;
}

export async function createActivityLog(data: ActivityLogData): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("[Activity] Failed to create activity log:", error);
  }
}

export async function getActivityLogs(
  userId: string,
  options?: { limit?: number; offset?: number; action?: ActivityAction }
) {
  const { limit = 20, offset = 0, action } = options || {};
  return prisma.activityLog.findMany({
    where: {
      userId,
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export function getActivityActionLabel(action: ActivityAction): string {
  const labels: Record<ActivityAction, string> = {
    PROJECT_CREATED: "Project created",
    PROJECT_UPDATED: "Project updated",
    PROJECT_DELETED: "Project deleted",
    PROJECT_ARCHIVED: "Project archived",
    DEPLOYMENT_STARTED: "Deployment started",
    DEPLOYMENT_SUCCESS: "Deployment succeeded",
    DEPLOYMENT_FAILED: "Deployment failed",
    DEPLOYMENT_STOPPED: "Deployment stopped",
    DEPLOYMENT_RESTARTED: "Deployment restarted",
    DEPLOYMENT_DELETED: "Deployment deleted",
    ENVIRONMENT_CREATED: "Environment variable added",
    ENVIRONMENT_UPDATED: "Environment variable updated",
    ENVIRONMENT_DELETED: "Environment variable deleted",
  };
  return labels[action] || action;
}

export function getActivityActionIcon(action: ActivityAction): string {
  const icons: Record<ActivityAction, string> = {
    PROJECT_CREATED: "Plus",
    PROJECT_UPDATED: "Edit",
    PROJECT_DELETED: "Trash2",
    PROJECT_ARCHIVED: "Archive",
    DEPLOYMENT_STARTED: "Rocket",
    DEPLOYMENT_SUCCESS: "CheckCircle2",
    DEPLOYMENT_FAILED: "XCircle",
    DEPLOYMENT_STOPPED: "Square",
    DEPLOYMENT_RESTARTED: "RotateCcw",
    DEPLOYMENT_DELETED: "Trash2",
    ENVIRONMENT_CREATED: "Key",
    ENVIRONMENT_UPDATED: "Key",
    ENVIRONMENT_DELETED: "Trash2",
  };
  return icons[action] || "Activity";
}

export function getActivityActionColor(action: ActivityAction): string {
  const colors: Record<ActivityAction, string> = {
    PROJECT_CREATED: "text-[#8B5CF6]",
    PROJECT_UPDATED: "text-[#2563FF]",
    PROJECT_DELETED: "text-[#FF3366]",
    PROJECT_ARCHIVED: "text-[#FFCF32]",
    DEPLOYMENT_STARTED: "text-[#00E5FF]",
    DEPLOYMENT_SUCCESS: "text-[#00FF9C]",
    DEPLOYMENT_FAILED: "text-[#FF3366]",
    DEPLOYMENT_STOPPED: "text-[#FFCF32]",
    DEPLOYMENT_RESTARTED: "text-[#8B5CF6]",
    DEPLOYMENT_DELETED: "text-[#FF3366]",
    ENVIRONMENT_CREATED: "text-[#00FF9C]",
    ENVIRONMENT_UPDATED: "text-[#00E5FF]",
    ENVIRONMENT_DELETED: "text-[#FF3366]",
  };
  return colors[action] || "text-zinc-400";
}