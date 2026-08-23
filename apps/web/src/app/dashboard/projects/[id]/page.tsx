"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Rocket,
  GitBranch,
  Clock,
  Globe,
  Trash2,
  Settings,
  ExternalLink,
  Key,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  X,
  Container,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { DeploymentTimelineFromStatus } from "@/components/cloudscale/DeploymentTimeline";
import { StatusBadge, DeploymentStatus } from "@/components/cloudscale/StatusBadge";
import { DeploymentCard } from "@/components/cloudscale/DeploymentCard";
import { StatsCard, createStatData } from "@/components/cloudscale/StatsCard";
import { EnvironmentVariableManager } from "@/components/EnvironmentVariableManager";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, componentStyles } from "@/lib/design-system";

interface Deployment {
  id: string;
  status: DeploymentStatus;
  createdAt: string;
  liveUrl?: string | null;
  deploymentUrl?: string | null;
  containerId?: string | null;
  containerName?: string | null;
  containerPort?: number | null;
  imageName?: string | null;
  logs?: string | null;
}

interface Project {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  framework: string;
  status: DeploymentStatus;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  lastDeploymentId?: string | null;
  deployments?: Deployment[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-64 rounded" />
      <Skeleton className="h-6 w-48 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-12 text-center")}>
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
      <p className="text-zinc-500 mb-6">{message}</p>
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </div>
  );
}

function EmptyDeploymentsState({ onDeploy }: { onDeploy: () => void }) {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-12 text-center")}>
      <Rocket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">No deployments yet</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
        Your deployment history will appear here once you deploy this project.
      </p>
      <Button onClick={onDeploy} className="gap-2">
        <Rocket className="w-4 h-4" />
        Deploy Now
      </Button>
    </div>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchProject = useCallback(async () => {
    if (!mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (mountedRef.current) setIsLoading(true);
      const { id: projectId } = await params;
      const res = await fetch(`/api/projects/${projectId}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Project not found");
        throw new Error("Failed to fetch project");
      }

      const data = await res.json();
      if (mountedRef.current && !controller.signal.aborted) {
        setProject(data);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [params]);

  useEffect(() => {
    mountedRef.current = true;
    const init = () => {
      fetchProject();
    };
    setTimeout(init, 0);

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProject]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const { id: projectId } = await params;
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create deployment");
      }

      await res.json();
      showToast("Deployment queued successfully", "success");

      // Refresh project to show new deployment
      const projectRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create deployment", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploymentAction = async (
    deploymentId: string,
    action: "stop" | "restart" | "delete" | "start"
  ) => {
    try {
      const endpoint =
        action === "delete"
          ? `/api/deployments/${deploymentId}/delete`
          : `/api/deployments/${deploymentId}/${action}`;
      const method = action === "delete" ? "DELETE" : "POST";

      const res = await fetch(endpoint, { method });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} deployment`);
      }

      showToast(`Deployment ${action} successful`, "success");

      // Refresh project to update deployment list
      const { id: projectId } = await params;
      const projectRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Failed to ${action} deployment`, "error");
    }
  };

  const confirmAction = (deploymentId: string, action: "stop" | "restart" | "delete" | "start") => {
    const messages = {
      stop: "Stop this deployment? The container will be stopped but deployment history will remain.",
      restart: "Restart this deployment? This will create a new deployment with the same configuration.",
      delete: "Delete this deployment? This action cannot be undone.",
      start: "Start this deployment? This will create a new deployment with the same configuration.",
    };
    if (confirm(messages[action])) {
      handleDeploymentAction(deploymentId, action);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Project" description="Loading project details...">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout title="Project Not Found" description="The requested project does not exist.">
        <ErrorState message={error || "Project does not exist"} onBack={() => router.push("/dashboard")} />
      </DashboardLayout>
    );
  }

  const latestDeployment = project.deployments?.[0];
  const isRunning = latestDeployment?.status === "RUNNING";

  return (
    <DashboardLayout
      title={project.name}
      description={`${project.githubRepo} • ${project.branch} • ${project.framework}`}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-xl border",
              "animate-in fade-in duration-200",
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-sm">
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {toast.message}
            </span>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Section 1: Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
        >
          <div className="p-5 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-semibold text-white truncate">{project.name}</h1>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4" />
                    <span className="font-mono bg-white/[0.03] px-2 py-1 rounded border border-white/5">{project.githubRepo}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4" />
                    <span className="px-2 py-1 rounded border border-white/5 bg-white/[0.03] font-mono text-xs">{project.branch}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Container className="w-4 h-4" />
                    <span className="font-mono">{project.framework}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Created {formatRelativeTime(project.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Deploy
                    </>
                  )}
                </Button>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Visit
                  </a>
                )}
                {isRunning && latestDeployment && (
                  <a
                    href={`/dashboard/deployments/${latestDeployment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open App
                  </a>
                )}
                <Link
                  href={`/dashboard/projects/${project.id}/settings`}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors",
                    "rounded-lg hover:bg-white/5"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Deployment Quick View */}
          {latestDeployment && (
            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={latestDeployment.status} />
                  <div>
                    <p className="text-sm font-medium text-white">Latest Deployment</p>
                    <p className="text-xs text-zinc-500 font-mono">#{latestDeployment.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(latestDeployment.createdAt)}
                  </span>
                  {latestDeployment.liveUrl && (
                    <a
                      href={latestDeployment.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 2: Project Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                createStatData("Deployments", project.deployments?.length || 0, { variant: "deployments" }),
                createStatData("Running", project.deployments?.filter(d => d.status === "RUNNING").length || 0, { variant: "running" }),
                createStatData("Failed", project.deployments?.filter(d => d.status === "FAILED").length || 0, { variant: "failed" }),
                createStatData("Total", project.deployments?.length || 0, { variant: "total" }),
              ].map((stat) => (
                <StatsCard key={stat.label} stats={[stat]} columns={1} gap="md" variant="default" />
              ))}
            </motion.div>

            {/* Section 3: Latest Deployment with Timeline */}
            {latestDeployment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
              >
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                    Latest Deployment
                  </h3>
                  <a
                    href={`/dashboard/deployments/${latestDeployment.id}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-5">
                  <DeploymentTimelineFromStatus
                    status={latestDeployment.status}
                    startedAt={latestDeployment.createdAt}
                    completedAt={latestDeployment.status === "RUNNING" ? latestDeployment.createdAt : undefined}
                  />
                </div>
              </motion.div>
            )}

            {/* Section 4: Deployment History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold tracking-tight text-white">Deployment History</h3>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      New Deployment
                    </>
                  )}
                </Button>
              </div>

              {project.deployments && project.deployments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Deployments">
                  {project.deployments.map((deployment) => (
                    <DeploymentCard
                      key={deployment.id}
                      deployment={{
                        id: deployment.id,
                        projectId: project.id,
                        projectName: project.name,
                        status: deployment.status,
                        createdAt: deployment.createdAt,
                        startedAt: null,
                        completedAt: null,
                        failedAt: null,
                        liveUrl: deployment.liveUrl,
                        deploymentUrl: deployment.deploymentUrl,
                        containerId: deployment.containerId,
                        containerName: deployment.containerName,
                        containerPort: deployment.containerPort,
                        imageName: deployment.imageName,
                        logs: deployment.logs,
                      }}
                      variant="default"
                      showActions
                      onViewLogs={(id) => router.push(`/dashboard/deployments/${id}`)}
                      onRetry={(id) => confirmAction(id, "restart")}
                      onStop={(id) => confirmAction(id, "stop")}
                      onOpenLive={(url) => window.open(url, "_blank")}
                    />
                  ))}
                </div>
              ) : (
                <EmptyDeploymentsState onDeploy={handleDeploy} />
              )}
            </motion.div>
          </div>

          {/* Sidebar: 1/3 width - Environment Variables + Project Info */}
          <div className="space-y-6">
            {/* Environment Variables */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
            >
              <EnvironmentVariableManager
                projectId={project.id}
              />
            </motion.div>

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
            >
              <div className="p-5 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-violet-400" />
                  Project Information
                </h3>
              </div>
              <div className="p-5 space-y-4 divide-y divide-white/5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500">Project ID</p>
                    <p className="font-mono text-white truncate">{project.id}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Framework</p>
                    <p className="font-mono text-white">{project.framework}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Branch</p>
                    <p className="font-mono bg-white/[0.03] px-2 py-1 rounded border border-white/5">{project.branch}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Port</p>
                    <p className="font-mono text-white">{project.deployments?.[0]?.containerPort || "—"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Repository</p>
                  <a
                    href={`https://github.com/${project.githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-white hover:text-cyan-400 transition-colors"
                  >
                    {project.githubRepo}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Danger Zone</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmAction(project.id, "delete")}
                    className="w-full gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}