"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Server,
  ArrowRight,
  Square,
  Terminal,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { StatsCard, createStatData } from "@/components/cloudscale/StatsCard";
import { ProjectCard } from "@/components/cloudscale/ProjectCard";
import { DeploymentCard } from "@/components/cloudscale/DeploymentCard";
import { DeploymentStatus } from "@/components/cloudscale/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, componentStyles } from "@/lib/design-system";

interface ProjectData {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  port: number;
  createdAt: string;
  latestDeployment?: {
    id: string;
    status: DeploymentStatus;
    createdAt: string;
    liveUrl?: string | null;
    deploymentUrl?: string | null;
  } | null;
  deploymentCount?: number;
}

interface DeploymentData {
  id: string;
  projectId: string;
  projectName: string;
  status: DeploymentStatus;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  liveUrl?: string | null;
  deploymentUrl?: string | null;
  containerId?: string | null;
  containerName?: string | null;
  containerPort?: number | null;
  imageName?: string | null;
  logs?: string | null;
}

function ProjectSkeleton() {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-5 space-y-4")}>
      <Skeleton className="h-6 w-1/3 rounded" />
      <Skeleton className="h-4 w-1/2 rounded" />
      <Skeleton className="h-4 w-1/4 rounded" />
      <div className="flex items-center gap-3 pt-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function DeploymentSkeleton() {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-5 space-y-4")}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/3 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction, variant = "default" }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: "default" | "centered";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        componentStyles.card.base,
        componentStyles.card.hover,
        componentStyles.card.elevated,
        "p-5 md:p-6 text-center",
        variant === "centered" && "py-4 md:py-5"
      )}
      style={{ minHeight: variant === "centered" ? "240px" : "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center border border-white/10"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.1) 100%)" }}
      >
        <Icon className="w-5 h-5 text-blue-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-base font-medium text-white mb-1"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-zinc-500 mb-3 max-w-sm mx-auto leading-relaxed"
      >
        {description}
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="inline-flex items-center gap-2 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-[0_0_24px_-6px_rgba(59,130,246,0.4)] transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </motion.button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<DeploymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploymentsLoading, setIsDeploymentsLoading] = useState(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    repository: "",
    branch: "main",
    framework: "Next.js",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (!mountedRef.current) return;
    setToast({ message, type });
    setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 3000);
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (mountedRef.current) setIsLoading(true);
      const res = await fetch("/api/projects", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) {
        if (res.status === 401) {
          if (mountedRef.current) router.push("/auth/signin?callbackUrl=/dashboard");
          return;
        }
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      if (mountedRef.current && !controller.signal.aborted) {
        setProjects(data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      if (!mountedRef.current) return;
      console.error("Failed to fetch projects:", error);
      showToast("Failed to load projects", "error");
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [showToast, router]);

  const fetchRecentDeployments = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      if (mountedRef.current) setIsDeploymentsLoading(true);
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          if (mountedRef.current) router.push("/auth/signin?callbackUrl=/dashboard");
          return;
        }
        throw new Error("Failed to fetch deployments");
      }
      const projectsData = await res.json();

      const allDeployments: DeploymentData[] = [];
      for (const project of projectsData) {
        if (project.latestDeployment) {
          allDeployments.push({
            id: project.latestDeployment.id,
            projectId: project.id,
            projectName: project.name,
            status: project.latestDeployment.status,
            createdAt: project.latestDeployment.createdAt,
            startedAt: null,
            completedAt: null,
            failedAt: null,
            liveUrl: project.latestDeployment.liveUrl,
            deploymentUrl: project.latestDeployment.deploymentUrl,
            containerId: null,
            containerName: null,
            containerPort: project.port,
            imageName: null,
            logs: null,
          });
        }
      }

      allDeployments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (mountedRef.current) {
        setRecentDeployments(allDeployments.slice(0, 5));
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error("Failed to fetch deployments:", error);
    } finally {
      if (mountedRef.current) {
        setIsDeploymentsLoading(false);
      }
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        await res.json();
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const init = () => {
      fetchProjects();
      fetchRecentDeployments();
      fetchUser();
    };
    setTimeout(init, 0);

    intervalRef.current = setInterval(() => {
      fetchProjects();
      fetchRecentDeployments();
    }, 10000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProjects, fetchRecentDeployments, fetchUser]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    setIsDeploying(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          githubRepo: formData.repository,
          branch: formData.branch,
          framework: formData.framework,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      await res.json();
      await fetchProjects();
      await fetchRecentDeployments();
      if (mountedRef.current) {
        setFormData({ name: "", repository: "", branch: "main", framework: "Next.js" });
        setIsDeployModalOpen(false);
        showToast("Project created successfully", "success");
      }
    } catch (error) {
      if (mountedRef.current) {
        showToast(error instanceof Error ? error.message : "Failed to create project", "error");
      }
    } finally {
      if (mountedRef.current) {
        setIsDeploying(false);
      }
    }
  };

  const totalProjects = projects.length;
  const runningDeployments = recentDeployments.filter(d => d.status === "RUNNING").length;
  const failedDeployments = recentDeployments.filter(d => d.status === "FAILED").length;
  const totalDeployments = recentDeployments.length;

  const statCards = [
    createStatData("Projects", totalProjects, { variant: "projects", trend: totalProjects > 0 ? "up" : "neutral", change: 12, changePeriod: "this month" }),
    createStatData("Deployments", totalDeployments, { variant: "deployments", change: 8, changePeriod: "this week" }),
    createStatData("Running", runningDeployments, { variant: "running", trend: runningDeployments > 0 ? "up" : "neutral", change: 3, changePeriod: "today" }),
    createStatData("Failed", failedDeployments, { variant: "failed", change: -2, changePeriod: "this week" }),
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      description="Monitor your projects, deployments, and infrastructure."
    >
      <div className="space-y-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((stat) => (
            <StatsCard key={stat.label} stats={[stat]} columns={1} gap="md" variant="default" />
          ))}
        </motion.div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">Your Projects</h2>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsDeployModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading projects">
              {[1, 2, 3].map((i) => <ProjectSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Server}
              title="No projects yet"
              description="Deploy your first GitHub repository and CloudScale will handle builds, containers, and deployment automatically."
              actionLabel="Deploy Your First Project"
              onAction={() => setIsDeployModalOpen(true)}
              variant="centered"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Projects">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDeploy={() => router.push(`/dashboard/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Deployments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">Recent Deployments</h2>
            <Link
              href="/dashboard/deployments"
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isDeploymentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-busy="true" aria-label="Loading deployments">
              {[1, 2].map((i) => <DeploymentSkeleton key={i} />)}
            </div>
          ) : recentDeployments.length === 0 ? (
            <EmptyState
              icon={Terminal}
              title="No deployments yet"
              description="Your deployments will appear here once you create a project and push code to GitHub."
              actionLabel="Create Project"
              onAction={() => setIsDeployModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Recent deployments">
              {recentDeployments.map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                  variant="default"
                  showActions
                  onViewLogs={(id) => router.push(`/dashboard/projects/${deployment.projectId}?deployment=${id}`)}
                  onRetry={(id) => router.push(`/dashboard/projects/${deployment.projectId}?retry=${id}`)}
                  onStop={(id) => router.push(`/dashboard/projects/${deployment.projectId}?stop=${id}`)}
                  onOpenLive={(url) => window.open(url, "_blank")}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard/projects/new"
            className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.interactive, "p-6 text-center")}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Create Project</h3>
            <p className="text-sm text-zinc-500">Deploy a new repository from GitHub</p>
          </Link>

          <Link
            href="/dashboard/deployments"
            className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.interactive, "p-6 text-center")}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10">
              <Server className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-medium text-white mb-1">All Deployments</h3>
            <p className="text-sm text-zinc-500">View and manage all deployments</p>
          </Link>

          <a
            href="https://github.com/JainMehul05/CloudScale-project"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.interactive, "p-6 text-center")}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10">
              <ExternalLink className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Documentation</h3>
            <p className="text-sm text-zinc-500">Learn more about CloudScale</p>
          </a>
        </motion.div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed bottom-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-xl border",
            "animate-in fade-in duration-200",
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          <span className="flex items-center gap-2 text-sm">
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {toast.message}
          </span>
          <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/10 rounded">
            <Square className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isDeployModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeployModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "rounded-2xl overflow-hidden")}>
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                  <div>
                    <h3 className="text-lg font-semibold text-white">New Project</h3>
                    <p className="text-sm text-zinc-400">Deploy a new project from GitHub.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDeployModalOpen(false)}
                    className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleCreateProject} className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Repository</label>
                      <input
                        required
                        type="text"
                        placeholder="username/repo-name"
                        value={formData.repository}
                        onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                        className="w-full bg-[#030303] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name</label>
                        <input
                          required
                          type="text"
                          placeholder="my-awesome-app"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#030303] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Framework</label>
                        <select
                          value={formData.framework}
                          onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                          className="w-full bg-[#030303] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                        >
                          <option>Next.js</option>
                          <option>Node.js</option>
                          <option>React</option>
                          <option>Vue</option>
                          <option>Docker</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Branch</label>
                      <input
                        required
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full bg-[#030303] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDeployModalOpen(false)}
                      className="text-zinc-300 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isDeploying || !formData.repository || !formData.name}
                      className={cn(componentStyles.button.primary, "flex items-center gap-2", "disabled:opacity-50 disabled:cursor-not-allowed")}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          Create
                          <Plus className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}