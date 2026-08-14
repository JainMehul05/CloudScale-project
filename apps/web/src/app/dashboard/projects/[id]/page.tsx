"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Rocket,
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  Activity,
  Globe,
  Key,
  Container,
  Copy,
  Check,
  RotateCcw,
  Square,
  Trash2,
  AlertTriangle,
  X,
  Play,
} from "lucide-react";
import { EnvironmentVariableManager } from "@/components/EnvironmentVariableManager";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";

type DeploymentStatus = "PENDING" | "BUILDING" | "DEPLOYED" | "FAILED";

interface Deployment {
  id: string;
  status: DeploymentStatus;
  createdAt: string;
  liveUrl?: string | null;
  containerId?: string | null;
  containerName?: string | null;
  containerPort?: number | null;
  imageName?: string | null;
  logs?: string | null;
}

interface Project {
  id: string;
  name: string;
  repository: string;
  branch: string;
  framework: string;
  status: DeploymentStatus;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  lastDeploymentId?: string | null;
  deployments?: Deployment[];
}

const getStatusConfig = (status: DeploymentStatus) => {
  switch (status) {
    case "DEPLOYED":
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Deployed",
        styles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    case "BUILDING":
      return {
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        text: "Building",
        styles: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dot: "bg-amber-400 animate-pulse",
      };
    case "PENDING":
      return {
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "Pending",
        styles: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400",
      };
    case "FAILED":
      return {
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Failed",
        styles: "bg-red-500/10 text-red-400 border-red-500/20",
        dot: "bg-red-400",
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "env" | "deployments">("overview");
  const [copied, setCopied] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const { id: projectId } = await params;
        const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Project not found");
          throw new Error("Failed to fetch project");
        }

        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params]);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

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
    action: "stop" | "restart" | "delete"
  ) => {
    setActionLoading(deploymentId);
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

      if (action === "restart" && data.newDeploymentId) {
        // Refresh project to show new deployment
        const { id: projectId } = await params;
        const projectRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
        }
      } else if (action === "delete" || action === "stop") {
        // Refresh project to update deployment list
        const { id: projectId } = await params;
        const projectRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Failed to ${action} deployment`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmAction = (deploymentId: string, action: "stop" | "restart" | "delete") => {
    const messages = {
      stop: "Stop this deployment? The container will be stopped but deployment history will remain.",
      restart: "Restart this deployment? This will create a new deployment with the same configuration.",
      delete: "Delete this deployment? This action cannot be undone.",
    };
    if (confirm(messages[action])) {
      handleDeploymentAction(deploymentId, action);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <XCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
          <p className="text-zinc-500 mb-6">{error || "Project does not exist"}</p>
          <a
            href="/dashboard"
            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Projects</span>
            </a>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg">
              <CloudScaleLogo size="sm" className="text-white" />
              <span className="text-sm font-medium text-white">{project.name}</span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConfig.styles}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.text}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeploy}
              disabled={isDeploying || project.status === "BUILDING" || project.status === "PENDING"}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Deploy
                </>
              )}
            </button>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Visit
              </a>
            )}
          </div>
        </header>

        {toast && (
          <div className={`mx-4 lg:mx-8 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            <span className="flex items-center gap-2 text-sm">
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {toast.message}
            </span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <CloudScaleLogo size="lg" className="text-white" />
              <div>
                <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
                <p className="text-sm text-zinc-500">{project.repository}</p>
              </div>
            </div>

            <div className="flex gap-2 border-b border-white/10">
              {[
                { id: "overview", label: "Overview", icon: Container },
                { id: "env", label: "Environment", icon: Key },
                { id: "deployments", label: "Deployments", icon: Rocket },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Framework", value: project.framework, icon: Container },
                    { label: "Branch", value: project.branch, icon: GitBranch },
                    { label: "Status", value: statusConfig.text, icon: Activity },
                    { label: "Created", value: formatDate(project.createdAt), icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center border border-white/5">
                        <stat.icon className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                        <p className="font-mono text-sm text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {project.url && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-3">Live URL</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-[200px] bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-zinc-300 truncate hover:border-blue-500/50 transition-colors"
                      >
                        {project.url}
                      </a>
                      <button
                        onClick={() => handleCopy(project.url!, "URL")}
                        className={`flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-sm font-medium transition-colors ${
                          copied === "URL" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : ""
                        }`}
                      >
                        {copied === "URL" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === "URL" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                {project.deployments && project.deployments.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-3">Latest Deployment</h3>
                    <div className="space-y-3">
                      {project.deployments.slice(0, 3).map((deployment) => {
                        const depStatus = getStatusConfig(deployment.status);
                        return (
                          <div key={deployment.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${depStatus.styles}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${depStatus.dot}`} />
                                {depStatus.text}
                              </span>
                              <span className="font-mono text-xs text-zinc-400">{deployment.id.slice(0, 8)}</span>
                              <span className="text-xs text-zinc-500">{formatDate(deployment.createdAt)}</span>
                            </div>
                            {deployment.liveUrl && (
                              <a href={deployment.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                                View
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "env" && (
              <div className="animate-in fade-in duration-200">
                <EnvironmentVariableManager
                  projectId={project.id}
                  initialEnvVars={[]}
                  onEnvVarsChange={() => {}}
                />
              </div>
            )}

            {activeTab === "deployments" && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-medium text-white">Deployment History</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {project.deployments && project.deployments.length > 0 ? (
                      project.deployments.map((deployment) => {
                        const depStatus = getStatusConfig(deployment.status);
                        return (
                          <div key={deployment.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${depStatus.styles} shrink-0`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${depStatus.dot}`} />
                                {depStatus.text}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm text-white">{deployment.id.slice(0, 12)}</span>
                                  <span className="text-xs text-zinc-500">{formatFullDate(deployment.createdAt)}</span>
                                </div>
                                {deployment.containerName && (
                                  <p className="text-xs text-zinc-500 font-mono">{deployment.containerName}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {deployment.liveUrl && (
                                <a
                                  href={deployment.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  Visit
                                </a>
                              )}
                              {deployment.logs && (
                                <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                  <Terminal className="w-3.5 h-3.5" />
                                  Logs
                                </button>
                              )}
                              {deployment.status === "DEPLOYED" && (
                                <>
                                  <button
                                    onClick={() => confirmAction(deployment.id, "stop")}
                                    disabled={actionLoading === deployment.id}
                                    className="flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                                    title="Stop deployment"
                                  >
                                    <Square className="w-3.5 h-3.5" />
                                    Stop
                                  </button>
                                  <button
                                    onClick={() => confirmAction(deployment.id, "restart")}
                                    disabled={actionLoading === deployment.id}
                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                    title="Restart deployment"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Restart
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => confirmAction(deployment.id, "delete")}
                                disabled={actionLoading === deployment.id}
                                className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                title="Delete deployment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-zinc-500">
                        <Rocket className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                        <p className="text-sm">No deployments yet</p>
                        <p className="text-xs text-zinc-600 mt-1">Deployments will appear here after you push code</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}