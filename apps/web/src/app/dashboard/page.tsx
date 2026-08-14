"use client";

import React, { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Rocket,
  Settings,
  BookOpen,
  Plus,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Menu,
  X,
  GitBranch,
  Terminal,
  Activity,
  MoreVertical,
  Search,
  Server,
  Database,
  Layers,
  TerminalSquare,
  LogOut,
  TrendingUp,
} from "lucide-react";

import { DeploymentLogViewer } from "@/components/DeploymentLogViewer";
import { signOut } from "next-auth/react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn, getStatusStyles } from "@/lib/design-system";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

type DeploymentStatus =
  | "PENDING"
  | "BUILDING"
  | "DEPLOYED"
  | "FAILED"
  | "STOPPED";

interface Project {
  id: string;
  name: string;
  repository: string;
  branch: string;
  status: DeploymentStatus;
  url: string | null;
  framework: string;
  createdAt: string;
  updatedAt: string;
  lastDeploymentId?: string;
}

interface NewDeploymentPayload {
  name: string;
  repository: string;
  branch: string;
  framework: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  valueColor?: string;
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon, trend, valueColor }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-sm",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",
        "flex items-center justify-between",
        "hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
      )}
    >
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{label}</p>
        <h3 className={cn("text-2xl font-bold tracking-tight", valueColor || "text-white")}>
          {value}
        </h3>
        {trend && (
          <span className={cn("text-xs font-medium mt-1 flex items-center gap-1", trend.positive ? "text-emerald-400" : "text-red-400")}>
            <TrendingUp className={cn("w-3 h-3", trend.positive ? "" : "rotate-180")} />
            {trend.value}
          </span>
        )}
      </div>
      <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/5">
        {icon}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, onViewLogs }: { project: Project; onViewLogs: (id: string) => void }) {
  const statusStyles = getStatusStyles(project.status.toLowerCase() as "deployed" | "building" | "pending" | "failed" | "stopped");
  const statusLabel = project.status.charAt(0) + project.status.slice(1).toLowerCase();

  return (
    <Link
      key={project.id}
      href={`/dashboard/projects/${project.id}`}
      className={cn(
        "group flex flex-col bg-[#111111] border border-white/10 rounded-2xl overflow-hidden",
        "transition-all duration-300",
        "hover:border-white/20 hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)]"
      )}
    >
      <div className="p-5 border-b border-white/5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{project.name}</h3>
              <p className="text-xs text-zinc-500 truncate">{project.repository}</p>
            </div>
          </div>
          <button className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded" aria-label="More options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-4">
          <span className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">
            <GitBranch className="w-3.5 h-3.5" />
            {project.branch}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>

      <div className="p-4 bg-black/40 flex items-center justify-between mt-auto">
        <span className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
          statusStyles.bg.replace("rgba(", "bg-").replace(")", ""),
          statusStyles.text.replace("text-", ""),
          statusStyles.border.replace("rgba(", "border-").replace(")", "")
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyles.dot.replace("bg-", "bg-"))} />
          {statusLabel}
        </span>
        
        <div className="flex items-center gap-2">
          {project.lastDeploymentId && (
            <button
              onClick={(e) => { e.preventDefault(); onViewLogs(project.lastDeploymentId!); }}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <TerminalSquare className="w-3.5 h-3.5" />
              Logs
            </button>
          )}
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Visit <Globe className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs font-mono text-zinc-600">{project.id.slice(0, 8)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]"
    >
      <Icon className="w-10 h-10 text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 text-center px-4">{description}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {actionLabel}
      </button>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState<NewDeploymentPayload>({
    name: "",
    repository: "",
    branch: "main",
    framework: "Next.js"
  });
  const [logViewerDeploymentId, setLogViewerDeploymentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchProjects = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      const res = await fetch("/api/projects", { 
        cache: "no-store",
        signal: abortControllerRef.current.signal 
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Failed to fetch projects:", error);
      showToast("Failed to load projects", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.email) setUserEmail(data.user.email);
      }
    } catch {
      // Ignore
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchProjects();
    fetchUser();
/* eslint-enable react-hooks/set-state-in-effect */
    const interval = setInterval(fetchProjects, 10000);
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProjects, fetchUser]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleCreateDeployment = async (e: FormEvent) => {
    e.preventDefault();
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
      setFormData({ name: "", repository: "", branch: "main", framework: "Next.js" });
      setIsDeployModalOpen(false);
      showToast("Project created successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to create project", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  // Derived State
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.repository.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeDeployments = projects.filter(
    p => p.status === "PENDING" || p.status === "BUILDING"
  ).length;
  
  const completedProjects = projects.filter(
    p => p.status === "DEPLOYED" || p.status === "FAILED"
  );
  
  const successRate = completedProjects.length > 0
    ? Math.round((completedProjects.filter(p => p.status === "DEPLOYED").length / completedProjects.length) * 100)
    : 0;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl lg:static lg:flex",
          "transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <CloudScaleLogo size="md" showText textSize="lg" className="text-white" />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Overview
          </p>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-white font-medium border border-white/5"
            aria-current="page"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            Projects
          </Link>
          <Link 
            href="#deployments" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors"
          >
            <Activity className="w-4 h-4" />
            Deployments
          </Link>
          <Link 
            href="#infrastructure" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors"
          >
            <Server className="w-4 h-4" />
            Infrastructure
          </Link>
          <Link 
            href="#storage" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors"
          >
            <Database className="w-4 h-4" />
            Storage
          </Link>
          
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 mt-8">
            Account
          </p>
          <Link 
            href="#settings" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link 
            href="#docs" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white font-medium shadow-inner">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white leading-tight truncate">{userEmail || "Loading..."}</span>
              <span className="text-xs text-zinc-500">Free Tier</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <header className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-sm">
              <span className="text-zinc-400">{userEmail || "user"}</span>
              <span className="mx-2 text-zinc-700">/</span>
              <span className="font-medium text-white">Projects</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                aria-label="Search projects"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDeployModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </motion.button>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <StatCard
                label="Total Projects"
                value={projects.length}
                icon={<Layers className="w-4 h-4 text-zinc-400" />}
                trend={projects.length > 0 ? { value: "+1 this week", positive: true } : undefined}
              />
              <StatCard
                label="Active Deployments"
                value={activeDeployments}
                icon={<Activity className="w-4 h-4 text-amber-400" />}
                valueColor="text-amber-400"
              />
              <StatCard
                label="Success Rate"
                value={`${successRate}%`}
                icon={<Terminal className="w-4 h-4 text-emerald-400" />}
                valueColor={successRate > 90 ? "text-emerald-400" : "text-white"}
                trend={completedProjects.length > 0 ? { value: "+2%", positive: true } : undefined}
              />
            </motion.div>

            {/* Projects Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-white">Your Projects</h2>
                {filteredProjects.length > 0 && (
                  <span className="text-sm text-zinc-500">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading projects">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  icon={Rocket}
                  title="No projects found"
                  description="Get started by deploying a new repository from GitHub."
                  actionLabel="Deploy Project"
                  onAction={() => setIsDeployModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Projects">
{filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewLogs={setLogViewerDeploymentId}
                      />
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>

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
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {toast.message}
            </span>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* New Deployment Modal */}
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
              <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Import Git Repository</h3>
                    <p className="text-sm text-zinc-400">Deploy a new project from GitHub.</p>
                  </div>
                  <button
                    onClick={() => setIsDeployModalOpen(false)}
                    className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateDeployment} className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Repository URL</label>
                      <div className="relative">
                        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          required
                          type="text"
                          placeholder="username/repo-name"
                          value={formData.repository}
                          onChange={(e) => setFormData({...formData, repository: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name</label>
                        <input
                          required
                          type="text"
                          placeholder="my-awesome-app"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Framework</label>
                        <select
                          value={formData.framework}
                          onChange={(e) => setFormData({...formData, framework: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
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
                      <div className="relative">
                        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          required
                          type="text"
                          value={formData.branch}
                          onChange={(e) => setFormData({...formData, branch: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsDeployModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isDeploying || !formData.repository || !formData.name}
                      className="flex items-center gap-2 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          Deploy
                          <Rocket className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Log Viewer Modal */}
      <AnimatePresence>
        {logViewerDeploymentId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogViewerDeploymentId(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <DeploymentLogViewer
                deploymentId={logViewerDeploymentId}
                onClose={() => setLogViewerDeploymentId(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}