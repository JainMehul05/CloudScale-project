"use client";

import { Badge } from "@/components/ui/badge";
import { cn, getStatusStyles } from "@/lib/design-system";

export type DeploymentStatus =
  | "QUEUED"
  | "VALIDATING"
  | "CLONING"
  | "DETECTING"
  | "BUILDING"
  | "STARTING"
  | "HEALTH_CHECK"
  | "RUNNING"
  | "FAILED"
  | "STOPPED";

export interface StatusBadgeProps {
  status: DeploymentStatus;
  className?: string;
  showDot?: boolean;
}

const statusDisplayNames: Record<DeploymentStatus, string> = {
  QUEUED: "QUEUED",
  VALIDATING: "VALIDATING",
  CLONING: "CLONING",
  DETECTING: "DETECTING",
  BUILDING: "BUILDING",
  STARTING: "STARTING",
  HEALTH_CHECK: "HEALTH CHECK",
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  STOPPED: "STOPPED",
};

const statusColorMap: Record<DeploymentStatus, keyof typeof import("@/lib/design-system").colors.status> = {
  QUEUED: "pending",
  VALIDATING: "pending",
  CLONING: "pending",
  DETECTING: "pending",
  BUILDING: "building",
  STARTING: "building",
  HEALTH_CHECK: "building",
  RUNNING: "deployed",
  FAILED: "failed",
  STOPPED: "stopped",
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const colorKey = statusColorMap[status];
  const styles = getStatusStyles(colorKey);
  const displayName = statusDisplayNames[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200",
        `bg-[${styles.bg}] text-[${styles.text}] border-[${styles.border}]`,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", `bg-[${styles.dot}]`)}
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{displayName}</span>
    </Badge>
  );
}