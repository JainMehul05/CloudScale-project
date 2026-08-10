"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Layers
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Interfaces (Preserved from existing logic)
// ---------------------------------------------------------------------------

type DeploymentStatus =
  | "PENDING"
  | "BUILDING"
  | "DEPLOYED"
  | "FAILED";

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


// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  // --- State Management ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState<NewDeploymentPayload>({
    name: "",
    repository: "",
    branch: "main",
    framework: "Next.js"
  });
  
  const fetchProjects = async () => {
  
    try {
  
      setIsLoading(true);
  
      const res = await fetch("/api/projects", {
        cache: "no-store",
      });
  
  
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
  
  
      const data = await res.json();
  
  
      setProjects(data);
  
  
    } catch (error) {
  
      console.error(
        "Failed to fetch projects:",
        error
      );
  
    } finally {
  
      setIsLoading(false);
  
    }
  
  };
  // Fetch real projects from backend
  useEffect(() => {
    const init = async () => {
      fetchProjects();
      const interval = setInterval(() => {
        fetchProjects();
      }, 10000);

      return () => clearInterval(interval);
    };
    init();
  }, []);


const handleCreateDeployment = async (e: FormEvent) => {
  e.preventDefault();

  setIsDeploying(true);

  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        githubRepo: formData.repository,
        branch: formData.branch,
        framework: formData.framework,
      }),
    });


    if (!res.ok) {
      throw new Error("Deployment failed");
    }


    await res.json();

    await fetchProjects();


    setFormData({
      name: "",
      repository: "",
      branch: "main",
      framework: "Next.js",
    });


    setIsDeployModalOpen(false);


  } catch (error) {

    console.error(
      "Deployment error:",
      error
    );

  } finally {

    setIsDeploying(false);

  }
};

  // --- Derived State ---
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.repository.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeDeployments = projects.filter(
    p =>
      p.status === "PENDING" ||
      p.status === "BUILDING"
  ).length;
  const completedProjects = projects.filter(
    p =>
      p.status === "DEPLOYED" ||
      p.status === "FAILED"
  );
  
  
  const successRate =
    completedProjects.length > 0
      ? Math.round(
          (
            completedProjects.filter(
              p => p.status === "DEPLOYED"
            ).length /
            completedProjects.length
          ) * 100
        )
      : 0;

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------

  const getStatusConfig = (status: DeploymentStatus) => {
    switch (status) {
      case "DEPLOYED":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          text: "Deployed",
          styles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          dot: "bg-emerald-400"
        };
        case "BUILDING":
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          text: "Building",
          styles: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          dot: "bg-amber-400 animate-pulse"
        };
      case "PENDING":
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          text: "Pending",
          styles: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          dot: "bg-blue-400"
        };
      case "FAILED":
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          text: "Failed",
          styles: "bg-red-500/10 text-red-400 border-red-500/20",
          dot: "bg-red-400"
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

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* ----------------------------------------------------------------------
          SIDEBAR
      ---------------------------------------------------------------------- */}
      
      {/* Mobile Sidebar Overlay */}
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
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl lg:static lg:flex transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Rocket className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-lg">CloudScale</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Overview
          </p>
          <a href="#" className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-white font-medium border border-white/5">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            Projects
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors">
            <Activity className="w-4 h-4" />
            Deployments
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors">
            <Server className="w-4 h-4" />
            Infrastructure
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors">
            <Database className="w-4 h-4" />
            Storage
          </a>
          
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 mt-8">
            Account
          </p>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-colors">
            <BookOpen className="w-4 h-4" />
            Documentation
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white font-medium shadow-inner">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">John Doe</span>
              <span className="text-xs text-zinc-500">Free Tier</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ----------------------------------------------------------------------
          MAIN CONTENT AREA
      ---------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center text-sm">
              <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">johndoe</span>
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
              />
            </div>
            <button 
              onClick={() => setIsDeployModalOpen(true)}
              className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Projects", value: projects.length, icon: Layers },
                { label: "Active Deployments", value: activeDeployments, icon: Activity, valueColor: "text-amber-400" },
                { label: "Success Rate", value: `${successRate}%`, icon: Terminal, valueColor: successRate > 90 ? "text-emerald-400" : "text-white" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500 mb-1">{stat.label}</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${stat.valueColor || "text-white"}`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/5">
                    <stat.icon className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-white">Your Projects</h2>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Rocket className="w-10 h-10 text-zinc-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">No projects found</h3>
                  <p className="text-sm text-zinc-500 mb-4">Get started by deploying a new repository.</p>
                  <button 
                    onClick={() => setIsDeployModalOpen(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Deploy Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => {
                    const statusConfig = getStatusConfig(project.status);
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={project.id}
                        className="group flex flex-col bg-[#111111] border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)]"
                      >
                        {/* Card Header */}
                        <div className="p-5 border-b border-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                                <GitBranch className="w-4 h-4 text-zinc-300" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white truncate max-w-[180px]">
                                  {project.name}
                                </h3>
                                <p className="text-xs text-zinc-500 truncate max-w-[180px]">
                                  {project.repository}
                                </p>
                              </div>
                            </div>
                            <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-4">
                            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">
                              <GitBranch className="w-3.5 h-3.5" />
                              {project.branch}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(project.updatedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-black/40 flex items-center justify-between mt-auto">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusConfig.styles}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.text}
                          </div>
                          
                          {project.url ? (
                            <a 
                              href={project.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                              Visit <Globe className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-xs font-mono text-zinc-600">
                              {project.id.split('_')[1]}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ----------------------------------------------------------------------
          NEW DEPLOYMENT MODAL (Preserving POST logic entry point)
      ---------------------------------------------------------------------- */}
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
                    <button
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
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}