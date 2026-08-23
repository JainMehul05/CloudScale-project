"use client";

import { cn, getStatusStyles } from "@/lib/design-system";
import { DeploymentStatus } from "./StatusBadge";
import { CheckCircle, Clock, XCircle, Loader2, ChevronRight } from "lucide-react";

export type TimelineStepStatus = "completed" | "current" | "failed" | "pending";

export interface TimelineStep {
  id: DeploymentStatus;
  label: string;
  status: TimelineStepStatus;
  timestamp?: Date | string | null;
  duration?: number;
}

const PIPELINE_STEPS: DeploymentStatus[] = [
  "QUEUED",
  "VALIDATING",
  "CLONING",
  "DETECTING",
  "BUILDING",
  "STARTING",
  "HEALTH_CHECK",
  "RUNNING",
];

const stepLabels: Record<DeploymentStatus, string> = {
  QUEUED: "Queued",
  VALIDATING: "Validating",
  CLONING: "Cloning",
  DETECTING: "Detecting",
  BUILDING: "Building",
  STARTING: "Starting",
  HEALTH_CHECK: "Health Check",
  RUNNING: "Running",
  FAILED: "Failed",
  STOPPED: "Stopped",
};

export interface DeploymentTimelineProps {
  currentStatus: DeploymentStatus;
  steps?: TimelineStep[];
  className?: string;
  compact?: boolean;
  showTimestamps?: boolean;
}

function formatTimestamp(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDuration(ms: number | undefined): string {
  if (!ms || ms < 0) return "";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getStepStatus(stepId: DeploymentStatus, currentStatus: DeploymentStatus): TimelineStepStatus {
  const currentIndex = PIPELINE_STEPS.indexOf(currentStatus);
  const stepIndex = PIPELINE_STEPS.indexOf(stepId);

  if (currentStatus === "FAILED" || currentStatus === "STOPPED") {
    if (stepIndex <= currentIndex) return "completed";
    if (stepIndex === currentIndex + 1) return "failed";
    return "pending";
  }

  if (currentStatus === "RUNNING") {
    return stepIndex <= currentIndex ? "completed" : "pending";
  }

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}

export function DeploymentTimeline({
  currentStatus,
  steps,
  className,
  compact = false,
  showTimestamps = true,
}: DeploymentTimelineProps) {
  const timelineSteps: TimelineStep[] = steps ?? PIPELINE_STEPS.map((stepId) => ({
    id: stepId,
    label: stepLabels[stepId],
    status: getStepStatus(stepId, currentStatus),
    timestamp: undefined,
    duration: undefined,
  }));

  const isTerminal = currentStatus === "RUNNING" || currentStatus === "FAILED" || currentStatus === "STOPPED";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {timelineSteps.map((step, index) => {
        const isLast = index === timelineSteps.length - 1;
        const stepStyles = getStatusStyles(
          step.status === "completed" || step.status === "current"
            ? "deployed"
            : step.status === "failed"
            ? "failed"
            : "pending"
        );

        const showConnector = !isLast && !compact;

        let icon: React.ReactNode;
        const iconClass = "w-5 h-5 shrink-0 flex items-center justify-center";

        switch (step.status) {
          case "completed":
            icon = <CheckCircle className={cn(iconClass, `text-[${stepStyles.dot}]`)} />;
            break;
          case "current":
            icon = <Loader2 className={cn(iconClass, `text-[${stepStyles.dot}] animate-spin`)} />;
            break;
          case "failed":
            icon = <XCircle className={cn(iconClass, `text-[${stepStyles.dot}]`)} />;
            break;
          default:
            icon = (
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 shrink-0",
                  `border-[${stepStyles.border}]`
                )}
              />
            );
        }

        return (
          <div key={step.id} className="flex items-start gap-3 relative">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative z-10 transition-all duration-300",
                  step.status === "current" && "scale-110"
                )}
              >
                {icon}
              </div>
              {showConnector && (
                <div
                  className={cn(
                    "w-0.5 flex-1 mt-1 transition-colors duration-300",
                    step.status === "completed" || step.status === "current"
                      ? `bg-[${stepStyles.dot}]`
                      : "bg-white/5"
                  )}
                  style={{ height: compact ? "24px" : "40px" }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    step.status === "completed" || step.status === "current"
                      ? "text-white"
                      : step.status === "failed"
                      ? stepStyles.text
                      : "text-zinc-500"
                  )}
                >
                  {step.label}
                </span>
                {step.status === "current" && (
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full animate-pulse",
                      `bg-[${stepStyles.bg}] text-[${stepStyles.text}] border border-[${stepStyles.border}]`
                    )}
                  >
                    ACTIVE
                  </span>
                )}
              </div>

              {(showTimestamps && step.timestamp) || step.duration !== undefined ? (
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  {step.timestamp && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(step.timestamp)}
                    </span>
                  )}
                  {step.duration !== undefined && (
                    <span className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      {formatDuration(step.duration)}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {isTerminal && currentStatus !== "RUNNING" && (
        <div className="flex items-center gap-3 pt-2">
          <div className="flex flex-col items-center">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-400 font-medium">
              Deployment {currentStatus === "FAILED" ? "failed" : "stopped"}
            </p>
            {showTimestamps && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Final status: {stepLabels[currentStatus]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DeploymentTimelineFromStatus({
  status,
  startedAt,
  completedAt,
  className,
  compact = false,
}: {
  status: DeploymentStatus;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  className?: string;
  compact?: boolean;
}) {
  const steps: TimelineStep[] = PIPELINE_STEPS.map((stepId, index) => {
    const stepStatus = getStepStatus(stepId, status);
    let timestamp: Date | null = null;
    let duration: number | undefined;

    if (stepStatus === "completed" || stepStatus === "current") {
      if (startedAt) {
        const start = new Date(startedAt).getTime();
        timestamp = new Date(start + index * 15000);
        if (stepStatus === "completed" && completedAt) {
          const end = new Date(completedAt).getTime();
          duration = Math.floor((end - start) / PIPELINE_STEPS.length);
        }
      }
    }

    return {
      id: stepId,
      label: stepLabels[stepId],
      status: stepStatus,
      timestamp,
      duration,
    };
  });

  return <DeploymentTimeline currentStatus={status} steps={steps} className={className} compact={compact} />;
}