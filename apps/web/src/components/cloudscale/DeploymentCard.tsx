"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, DeploymentStatus } from "./StatusBadge";
import { cn, componentStyles, getStatusStyles } from "@/lib/design-system";
import { GitBranch, Clock, Globe, Trash2, RotateCcw, Play, Pause, Square, ExternalLink, Terminal, Download } from "lucide-react";

export interface DeploymentData {
  id: string;
  projectId: string;
  projectName: string;
  status: DeploymentStatus;
  createdAt: Date | string;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  failedAt?: Date | string | null;
  liveUrl?: string | null;
  deploymentUrl?: string | null;
  containerId?: string | null;
  containerName?: string | null;
  containerPort?: number | null;
  imageName?: string | null;
  logs?: string | null;
}

export interface DeploymentCardProps {
  deployment: DeploymentData;
  className?: string;
  onRetry?: (deploymentId: string) => void;
  onStop?: (deploymentId: string) => void;
  onDelete?: (deploymentId: string) => void;
  onViewLogs?: (deploymentId: string) => void;
  onOpenLive?: (url: string) => void;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
}

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatDuration(start?: Date | string | null, end?: Date | string | null): string {
  if (!start) return "—";
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = endTime - startTime;
  if (diffMs < 0) return "—";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function getStatusIcon(status: DeploymentStatus) {
  const styles = getStatusStyles(
    status === "RUNNING" ? "deployed" :
    status === "FAILED" ? "failed" :
    status === "STOPPED" ? "stopped" :
    status === "BUILDING" || status === "STARTING" || status === "HEALTH_CHECK" ? "building" : "pending"
  );

  switch (status) {
    case "RUNNING":
      return <Play className={cn("w-4 h-4", `text-[${styles.dot}]`)} />;
    case "BUILDING":
    case "STARTING":
    case "HEALTH_CHECK":
      return <RotateCcw className={cn("w-4 h-4 animate-spin", `text-[${styles.dot}]`)} />;
    case "FAILED":
      return <Square className={cn("w-4 h-4", `text-[${styles.dot}]`)} />;
    case "STOPPED":
      return <Pause className={cn("w-4 h-4", `text-[${styles.dot}]`)} />;
    default:
      return <Clock className={cn("w-4 h-4", `text-[${styles.dot}]`)} />;
  }
}

function getActionButtons({
  status,
  onRetry,
  onStop,
  onDelete,
  onViewLogs,
  onOpenLive,
  deployment,
  showActions,
}: {
  status: DeploymentStatus;
  onRetry?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewLogs?: (id: string) => void;
  onOpenLive?: (url: string) => void;
  deployment: DeploymentData;
  showActions?: boolean;
}) {
  if (!showActions) return null;

  const isActive = status === "BUILDING" || status === "STARTING" || status === "HEALTH_CHECK" || status === "RUNNING";
  const isTerminal = status === "RUNNING" || status === "FAILED" || status === "STOPPED";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onViewLogs?.(deployment.id)}
        className="text-zinc-400 hover:text-[#00E5FF]"
        aria-label="View logs"
      >
        <Terminal className="w-4 h-4" />
      </Button>

      {deployment.liveUrl && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenLive?.(deployment.liveUrl as string)}
          className="text-zinc-400 hover:text-[#00FF9C]"
          aria-label="Open live URL"
        >
          <Globe className="w-4 h-4" />
        </Button>
      )}

      {deployment.deploymentUrl && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => window.open(deployment.deploymentUrl!, "_blank")}
          className="text-zinc-400 hover:text-[#00E5FF]"
          aria-label="Open deployment URL"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      )}

      {isActive && onStop && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onStop?.(deployment.id)}
          className="text-zinc-400 hover:text-[#FFCF32]"
          aria-label="Stop deployment"
        >
          <Square className="w-4 h-4" />
        </Button>
      )}

      {isTerminal && onRetry && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRetry?.(deployment.id)}
          className="text-zinc-400 hover:text-[#00FF9C]"
          aria-label="Retry deployment"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete?.(deployment.id)}
          className="text-zinc-400 hover:text-[#FF3366]"
          aria-label="Delete deployment"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export function DeploymentCard({
  deployment,
  className,
  onRetry,
  onStop,
  onDelete,
  onViewLogs,
  onOpenLive,
  variant = "default",
  showActions = true,
}: DeploymentCardProps) {
  const statusStyles = getStatusStyles(
    deployment.status === "RUNNING" ? "deployed" :
    deployment.status === "FAILED" ? "failed" :
    deployment.status === "STOPPED" ? "stopped" :
    deployment.status === "BUILDING" || deployment.status === "STARTING" || deployment.status === "HEALTH_CHECK" ? "building" : "pending"
  );

  const baseStyles = cn(
    componentStyles.card.base,
    componentStyles.card.hover,
    componentStyles.card.elevated,
    "overflow-hidden transition-all duration-300",
    className
  );

  if (variant === "compact") {
    return (
      <div className={cn(baseStyles, "p-4 flex items-center justify-between gap-4")}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-[${statusStyles.bg}] border border-[${statusStyles.border}]`)}>
            {getStatusIcon(deployment.status)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{deployment.projectName}</p>
            <p className="text-xs text-zinc-500 truncate font-mono">
              {deployment.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={deployment.status} showDot />
          <span className="text-xs text-zinc-500 hidden sm:inline">
            {formatRelativeTime(deployment.createdAt)}
          </span>
          {showActions && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onViewLogs?.(deployment.id)}
              className="text-zinc-400 hover:text-[#00E5FF]"
              aria-label="View logs"
            >
              <Terminal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={baseStyles}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", `bg-[${statusStyles.bg}] border border-[${statusStyles.border}]`)}>
                {getStatusIcon(deployment.status)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg truncate">{deployment.projectName}</CardTitle>
                  <StatusBadge status={deployment.status} />
                </div>
                <CardDescription className="flex items-center gap-2 text-xs mt-1">
                  <GitBranch className="w-3 h-3" />
                  <span className="font-mono text-zinc-400">ID: {deployment.id.slice(0, 12)}...</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500">Created {formatRelativeTime(deployment.createdAt)}</span>
                </CardDescription>
              </div>
            </div>
            {showActions && getActionButtons({
              status: deployment.status,
              onRetry,
              onStop,
              onDelete,
              onViewLogs,
              onOpenLive,
              deployment,
              showActions,
            })}
          </div>
        </CardHeader>

        <CardContent className="py-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500">Duration</p>
              <p className="font-mono text-sm text-white mt-0.5">
                {formatDuration(deployment.startedAt, deployment.completedAt ?? deployment.failedAt)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="font-medium text-sm text-white mt-0.5 capitalize">
                {deployment.status.replace("_", " ").toLowerCase()}
              </p>
            </div>
            {deployment.containerPort && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-zinc-500">Port</p>
                <p className="font-mono text-sm text-white mt-0.5">{deployment.containerPort}</p>
              </div>
            )}
            {deployment.imageName && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-zinc-500">Image</p>
                <p className="font-mono text-xs text-white mt-0.5 truncate">{deployment.imageName}</p>
              </div>
            )}
          </div>

          {deployment.liveUrl && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#00FF9C]/10 to-[#00E5FF]/10 border border-[#00FF9C]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00FF9C]" />
                  <span className="text-sm font-medium text-[#00FF9C]">Live URL</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenLive?.(deployment.liveUrl!)}
                  className="text-[#00FF9C] hover:bg-[#00FF9C]/10"
                >
                  Open
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <p className="text-xs text-[#00FF9C]/80 mt-1 font-mono truncate max-w-xs">{deployment.liveUrl}</p>
            </div>
          )}

          {deployment.logs && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Recent Logs</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewLogs?.(deployment.id)}
                  className="text-zinc-400 hover:text-[#00E5FF]"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
              <pre className="text-xs text-zinc-300 font-mono bg-black/50 p-3 rounded-lg max-h-32 overflow-auto whitespace-pre-wrap">
                {deployment.logs.slice(-1000)}
              </pre>
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="pb-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 w-full justify-end">
              {getActionButtons({
                status: deployment.status,
                onRetry,
                onStop,
                onDelete,
                onViewLogs,
                onOpenLive,
                deployment,
                showActions: true,
              })}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={baseStyles}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-[${statusStyles.bg}] border border-[${statusStyles.border}]`)}>
              {getStatusIcon(deployment.status)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base truncate max-w-[300px]">{deployment.projectName}</CardTitle>
                <StatusBadge status={deployment.status} />
              </div>
              <CardDescription className="flex items-center gap-2 text-xs mt-1">
                <span className="font-mono text-zinc-400">{deployment.id.slice(0, 12)}...</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{formatRelativeTime(deployment.createdAt)}</span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-zinc-500">
                  {formatDuration(deployment.startedAt, deployment.completedAt ?? deployment.failedAt)}
                </span>
              </CardDescription>
            </div>
          </div>
          {showActions && getActionButtons({
            status: deployment.status,
            onRetry,
            onStop,
            onDelete,
            onViewLogs,
            onOpenLive,
            deployment,
            showActions,
          })}
        </div>
      </CardHeader>

      {deployment.liveUrl && (
        <div className="px-6 pb-3 border-b border-white/5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-left text-[#00FF9C] hover:bg-[#00FF9C]/10"
            onClick={() => onOpenLive?.(deployment.liveUrl!)}
          >
            <Globe className="w-4 h-4" />
            <span className="font-mono text-xs truncate max-w-[200px]">{deployment.liveUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto" />
          </Button>
        </div>
      )}

      {showActions && (
        <CardFooter className="pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 w-full justify-end">
            {getActionButtons({
              status: deployment.status,
              onRetry,
              onStop,
              onDelete,
              onViewLogs,
              onOpenLive,
              deployment,
              showActions: true,
            })}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}