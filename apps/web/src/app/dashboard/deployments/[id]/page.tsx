"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe,
  RotateCcw,
  Square,
  Trash2,
  Copy,
  AlertCircle,
  Terminal,
  Server,
  GitBranch,
  Clock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { DeploymentTimelineFromStatus } from "@/components/cloudscale/DeploymentTimeline";
import { StatusBadge, DeploymentStatus } from "@/components/cloudscale/StatusBadge";
import { DeploymentLogViewer } from "@/components/DeploymentLogViewer";
import { EnvironmentVariableManager } from "@/components/EnvironmentVariableManager";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, componentStyles } from "@/lib/design-system";

interface DeploymentDetail {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  progress: number;
  message: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  containerId: string | null;
  containerName: string | null;
  containerPort: number | null;
  imageName: string | null;
  liveUrl: string | null;
  project?: {
    name: string;
    githubRepo: string;
    branch: string;
  };
}

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDuration(start?: string | null, end?: string | null): string {
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

function DeploymentInfoCard({ label, value, icon, copyable = false, href }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  copyable?: boolean;
  href?: string;
}) {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.hover, "p-4 flex items-start gap-3")}>
      <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-white truncate flex-1 hover:text-cyan-400 transition-colors"
            >
              {value}
            </a>
          ) : (
            <code className="font-mono text-sm text-white truncate flex-1 bg-white/[0.03] px-2 py-1 rounded border border-white/5">
              {value}
            </code>
          )}
          {copyable && !href && (
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={`Copy ${label.toLowerCase()}`}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, variant = "ghost", icon, disabled, className }: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "ghost" | "danger" | "default";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const baseStyles = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20",
    default: "bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]",
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </Button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-12 text-center")}>
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Unable to load deployment</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">{message}</p>
      <Button onClick={onRetry} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-12 text-center")}>
      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Deployment not found</h3>
      <p className="text-sm text-zinc-500 mb-6">The deployment you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </div>
  );
}

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = params.id as string;

  const [deployment, setDeployment] = useState<DeploymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deploymentStatusRef = useRef<string | null>(null);

  const fetchDeployment = useCallback(async () => {
    if (!mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/deployments/${deploymentId}/status`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 404) {
          if (mountedRef.current) {
            setError("NOT_FOUND");
          }
          return;
        }
        throw new Error("Failed to fetch deployment");
      }

      const data = await res.json();
      if (mountedRef.current && !controller.signal.aborted) {
        setDeployment(data);
        deploymentStatusRef.current = data.status;
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError("Failed to load deployment");
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [deploymentId]);

  useEffect(() => {
    mountedRef.current = true;
    const init = () => {
      fetchDeployment();
    };
    setTimeout(init, 0);

    intervalRef.current = setInterval(() => {
      const currentStatus = deploymentStatusRef.current;
      if (currentStatus && !["RUNNING", "FAILED", "STOPPED"].includes(currentStatus)) {
        fetchDeployment();
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDeployment]);

  const handleRestart = async () => {
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/restart`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to restart");
      fetchDeployment();
    } catch {
      alert("Failed to restart deployment");
    }
  };

  const handleStop = async () => {
    if (!confirm("Stop this deployment? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/stop`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to stop");
      fetchDeployment();
    } catch {
      alert("Failed to stop deployment");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this deployment? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard");
    } catch {
      alert("Failed to delete deployment");
    }
  };

  const handleOpenLive = () => {
    if (deployment?.liveUrl) {
      window.open(deployment.liveUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Deployment" description="Loading deployment details...">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error === "NOT_FOUND") {
    return (
      <DashboardLayout title="Deployment Not Found" description="The requested deployment does not exist.">
        <NotFoundState onBack={() => router.push("/dashboard")} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" description="Failed to load deployment details.">
        <ErrorState message={error} onRetry={fetchDeployment} />
      </DashboardLayout>
    );
  }

  if (!deployment) {
    return (
      <DashboardLayout title="Deployment" description="Loading...">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  const project = deployment.project;
  const isActive = ["QUEUED", "VALIDATING", "CLONING", "DETECTING", "BUILDING", "STARTING", "HEALTH_CHECK"].includes(deployment.status);
  const isTerminal = ["RUNNING", "FAILED", "STOPPED"].includes(deployment.status);

  return (
    <DashboardLayout
      title={`Deployment #${deployment.id.slice(0, 8)}`}
      description={project ? `${project.name} &middot; ${project.githubRepo}` : "Monitor deployment progress and logs"}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Section 1: Deployment Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
        >
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <StatusBadge status={deployment.status} />
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="font-mono">#{deployment.id.slice(0, 12)}</span>
                </div>
              </div>
              {project && (
                <div className="hidden sm:flex items-center gap-3 text-sm text-zinc-500">
                  <span className="font-mono bg-white/[0.03] px-2 py-1 rounded border border-white/5">{project.githubRepo}</span>
                  <span className="px-2 py-1 rounded border border-white/5 bg-white/[0.03] font-mono text-xs">{project.branch}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 border-l border-white/10 pl-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Created {formatRelativeTime(deployment.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Duration: {formatDuration(deployment.startedAt, deployment.completedAt ?? deployment.failedAt)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {deployment.liveUrl && (
                  <ActionButton
                    variant="default"
                    onClick={handleOpenLive}
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Open Live
                  </ActionButton>
                )}
                {isTerminal && deployment.status === "RUNNING" && (
                  <ActionButton
                    variant="ghost"
                    onClick={handleRestart}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Restart
                  </ActionButton>
                )}
                {isActive && (
                  <ActionButton
                    variant="ghost"
                    onClick={handleStop}
                    icon={<Square className="w-4 h-4" />}
                  >
                    Stop
                  </ActionButton>
                )}
                <ActionButton
                  variant="danger"
                  onClick={handleDelete}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          </div>

          {project && (
            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">Repository:</span>
                <a
                  href={`https://github.com/${project.githubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-white hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  {project.githubRepo}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="font-mono bg-white/[0.03] px-2 py-1 rounded border border-white/5">{project.branch}</span>
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Pipeline + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 2: Deployment Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
            >
              <div className="p-5 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  Deployment Pipeline
                </h3>
              </div>
              <div className="p-5">
                <DeploymentTimelineFromStatus
                  status={deployment.status}
                  startedAt={deployment.startedAt}
                  completedAt={deployment.completedAt}
                />
              </div>
            </motion.div>

            {/* Section 3: Live Log Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative"
            >
              <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden h-[500px]")}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
                      <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Live Logs</h3>
                      <p className="text-xs text-zinc-500 font-mono">Streaming real-time deployment output</p>
                    </div>
                  </div>
                </div>
                <DeploymentLogViewer
                  deploymentId={deployment.id}
                  onClose={() => {}}
                />
              </div>
            </motion.div>

            {/* Section 4: Deployment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
            >
              <div className="p-5 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  Deployment Information
                </h3>
              </div>
              <div className="p-5 space-y-4 divide-y divide-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DeploymentInfoCard
                    label="Container ID"
                    value={deployment.containerId || "—"}
                    icon={<Terminal className="w-5 h-5 text-zinc-400" />}
                    copyable
                  />
                  <DeploymentInfoCard
                    label="Container Name"
                    value={deployment.containerName || "—"}
                    icon={<Server className="w-5 h-5 text-zinc-400" />}
                    copyable
                  />
                  <DeploymentInfoCard
                    label="Port"
                    value={deployment.containerPort ? String(deployment.containerPort) : "—"}
                    icon={<Globe className="w-5 h-5 text-zinc-400" />}
                  />
                  <DeploymentInfoCard
                    label="Image"
                    value={deployment.imageName || "—"}
                    icon={<Server className="w-5 h-5 text-zinc-400" />}
                    copyable
                  />
                </div>
                
                {(deployment.liveUrl || deployment.project?.githubRepo) && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">URLs</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {deployment.liveUrl && (
                        <DeploymentInfoCard
                          label="Live URL"
                          value={deployment.liveUrl}
                          icon={<Globe className="w-5 h-5 text-emerald-400" />}
                          href={deployment.liveUrl}
                        />
                      )}
                      {project && (
                        <DeploymentInfoCard
                          label="GitHub Repository"
                          value={`https://github.com/${project.githubRepo}`}
                          icon={<GitBranch className="w-5 h-5 text-violet-400" />}
                          href={`https://github.com/${project.githubRepo}`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Environment Variables */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
            >
              <EnvironmentVariableManager
                projectId={deployment.projectId}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}