"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Server,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { StatsCard, createStatData } from "@/components/cloudscale/StatsCard";
import { ProjectCard } from "@/components/cloudscale/ProjectCard";
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

interface StatsData {
  totalProjects: number;
  activeProjects: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

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
          if (mountedRef.current) router.push("/auth/signin?callbackUrl=/dashboard/projects");
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
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    const init = () => {
      fetchProjects();
    };
    setTimeout(init, 0);

    intervalRef.current = setInterval(() => {
      fetchProjects();
    }, 10000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProjects]);

  useEffect(() => {
    let result = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.githubRepo.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.latestDeployment?.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProjects(result);
  }, [projects, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: "name" | "createdAt") => {
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
      title="Projects"
      description="Manage your deployed projects and repositories."
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className={cn(
              "inline-flex items-center gap-2",
              componentStyles.button.primary
            )}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </motion.div>

        {/* Search & Filters */}
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  componentStyles.input.base,
                  "pl-9 pr-4"
                )}
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
                <option value="name">Name</option>
              </select>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="text-zinc-400 hover:text-white"
                aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                <ArrowRight className={cn("w-4 h-4", sortOrder === "asc" ? "rotate-180" : "")} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading projects">
              {[1, 2, 3].map((i) => <ProjectSkeleton key={i} />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              icon={Server}
              title={searchQuery || statusFilter !== "all" ? "No matching projects" : "No projects yet"}
              description={searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Deploy your first GitHub repository and CloudScale will handle builds, containers, and deployment automatically."}
              actionLabel="Create Project"
              onAction={() => router.push("/dashboard/projects/new")}
              variant="centered"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Projects">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDeploy={() => router.push(`/dashboard/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}