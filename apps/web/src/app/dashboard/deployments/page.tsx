"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Square,
  Pause,
  RotateCcw,
  Terminal,
  ExternalLink,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { StatsCard, createStatData } from "@/components/cloudscale/StatsCard";
import { DeploymentCard } from "@/components/cloudscale/DeploymentCard";
import { DeploymentStatus } from "@/components/cloudscale/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, componentStyles } from "@/lib/design-system";

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

interface StatsData {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  runningDeployments: number;
  successRate: number;
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

function StatsSkeleton() {
  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-5")}>
      <Skeleton className="h-4 w-1/4 rounded mb-2" />
      <Skeleton className="h-8 w-1/3 rounded" />
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

function formatRelativeTime(dateString: string): string {
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

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentData[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<DeploymentData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "status" | "projectName">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const fetchDeployments = useCallback(async () => {
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
          if (mountedRef.current) router.push("/auth/signin?callbackUrl=/dashboard/deployments");
          return;
        }
        throw new Error("Failed to fetch deployments");
      }
      const projectsData = await res.json();

      const allDeployments: DeploymentData[] = [];
      for (const project of projectsData) {
        if (project.deployments) {
          for (const deployment of project.deployments) {
            allDeployments.push({
              id: deployment.id,
              projectId: project.id,
              projectName: project.name,
              status: deployment.status,
              createdAt: deployment.createdAt,
              startedAt: null,
              completedAt: deployment.status === "RUNNING" ? deployment.createdAt : null,
              failedAt: null,
              liveUrl: deployment.liveUrl,
              deploymentUrl: deployment.deploymentUrl,
              containerId: deployment.containerId,
              containerName: deployment.containerName,
              containerPort: project.port,
              imageName: deployment.imageName,
              logs: deployment.logs,
            });
          }
        }
      }

      allDeployments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (mountedRef.current && !controller.signal.aborted) {
        setDeployments(allDeployments);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      if (!mountedRef.current) return;
      console.error("Failed to fetch deployments:", error);
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      if (mountedRef.current) setIsStatsLoading(true);
      const res = await fetch("/api/projects/stats", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          if (mountedRef.current) router.push("/auth/signin?callbackUrl=/dashboard/deployments");
          return;
        }
        throw new Error("Failed to fetch stats");
      }
      const data = await res.json();
      if (mountedRef.current) {
        setStats({
          totalDeployments: data.totalDeployments || 0,
          successfulDeployments: data.successfulDeployments || 0,
          failedDeployments: data.failedDeployments || 0,
          runningDeployments: data.activeProjects || 0,
          successRate: data.successRate || 0,
        });
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error("Failed to fetch stats:", error);
    } finally {
      if (mountedRef.current) {
        setIsStatsLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    const init = () => {
      fetchDeployments();
      fetchStats();
    };
    setTimeout(init, 0);

    intervalRef.current = setInterval(() => {
      fetchDeployments();
      fetchStats();
    }, 10000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDeployments, fetchStats]);

  useEffect(() => {
    let result = [...deployments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.projectName.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredDeployments(result);
  }, [deployments, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: "createdAt" | "status" | "projectName") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const statusOptions = ["all", "RUNNING", "BUILDING", "FAILED", "STOPPED", "QUEUED", "VALIDATING", "CLONING", "DETECTING", "STARTING", "HEALTH_CHECK"] as const;

  return (
    <DashboardLayout
      title="Deployments"
      description="View and manage all your deployments across projects."
    >
      <div className="space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {isStatsLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => <StatsSkeleton key={i} />)}
            </>
          ) : stats ? (
            <>
              <StatsCard stats={[createStatData("Total", stats.totalDeployments, { variant: "deployments" })]} columns={1} gap="md" variant="default" />
              <StatsCard stats={[createStatData("Running", stats.runningDeployments, { variant: "running" })]} columns={1} gap="md" variant="default" />
              <StatsCard stats={[createStatData("Successful", stats.successfulDeployments, { variant: "running", trend: stats.successfulDeployments > 0 ? "up" : "neutral" })]} columns={1} gap="md" variant="default" />
              <StatsCard stats={[createStatData("Failed", stats.failedDeployments, { variant: "failed" })]} columns={1} gap="md" variant="default" />
              <StatsCard stats={[createStatData("Success Rate", `${stats.successRate}%`, { variant: "success-rate", trend: stats.successRate > 80 ? "up" : stats.successRate > 50 ? "neutral" : "down" })]} columns={1} gap="md" variant="default" />
            </>
          ) : (
            <>
              {[1, 2, 3, 4, 5].map((i) => <StatsSkeleton key={i} />)}
            </>
          )}
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-4")}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="search"
                placeholder="Search deployments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(componentStyles.input.base, "pl-9 pr-4")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="bg-[#030303] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[140px]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-[#030303] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[140px]"
              >
                <option value="createdAt">Created Date</option>
                <option value="projectName">Project</option>
                <option value="status">Status</option>
              </select>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="text-zinc-400 hover:text-white"
                aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                <ChevronDown className={cn("w-4 h-4", sortOrder === "asc" ? "rotate-180" : "")} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Deployments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {filteredDeployments.length} of {deployments.length} deployment{deployments.length !== 1 ? "s" : ""}
            </h2>
            <Link
              href="/dashboard/projects/new"
              className={cn("inline-flex items-center gap-2", componentStyles.button.primary)}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading deployments">
              {[1, 2, 3].map((i) => <DeploymentSkeleton key={i} />)}
            </div>
          ) : filteredDeployments.length === 0 ? (
            <EmptyState
              icon={Terminal}
              title={searchQuery || statusFilter !== "all" ? "No matching deployments" : "No deployments yet"}
              description={searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Your deployments will appear here once you create a project and deploy."}
              actionLabel="Create Project"
              onAction={() => router.push("/dashboard/projects/new")}
              variant="centered"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Deployments">
              {filteredDeployments.map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                  variant="default"
                  showActions
                  onViewLogs={(id) => router.push(`/dashboard/deployments/${id}`)}
                  onRetry={(id) => router.push(`/dashboard/deployments/${id}?retry=true`)}
                  onStop={(id) => router.push(`/dashboard/deployments/${id}?stop=true`)}
                  onOpenLive={(url) => window.open(url, "_blank")}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}