"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Loader2,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Archive,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn, componentStyles } from "@/lib/design-system";
import { useToast } from "@/components/cloudscale/ToastProvider";
import { ConfirmDialog } from "@/components/cloudscale/ConfirmDialog";

interface ProjectData {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  framework: string;
  status: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

type Tab = "general" | "danger";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { addToast } = useToast();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const mountedRef = React.useRef(true);

  const fetchProject = useCallback(async () => {
    if (!mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (mountedRef.current) setIsLoading(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Project not found");
        if (res.status === 403) throw new Error("Access denied");
        throw new Error("Failed to fetch project");
      }

      const data = await res.json();
      if (mountedRef.current && !controller.signal.aborted) {
        setProject(data);
        setName(data.name);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!mountedRef.current) return;
      console.error("Failed to fetch project:", err);
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProject();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProject]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update project");
      }

      const data = await res.json();
      setProject(data);
      addToast({ message: "Project updated successfully", type: "success" });
    } catch (error) {
      addToast({ message: error instanceof Error ? error.message : "Failed to update project", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      addToast({ message: "Project name is required", type: "error" });
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      addToast({ message: "Use only letters, numbers, hyphens, and underscores", type: "error" });
      return false;
    }
    return true;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      addToast({ message: "Project deleted successfully", type: "success" });
      router.push("/dashboard/projects");
    } catch (error) {
      addToast({ message: error instanceof Error ? error.message : "Failed to delete project", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" description="Loading project settings...">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="h-8 w-1/3 bg-white/5 rounded" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found" description="The requested project does not exist.">
        <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-12 text-center max-w-md mx-auto")}>
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
          <p className="text-zinc-500 mb-6">The requested project does not exist or you don't have access to it.</p>
          <Link
            href="/dashboard/projects"
            className={cn("inline-flex items-center gap-2", componentStyles.button.primary)}
          >
            <RotateCcw className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Archive className="w-4 h-4" /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout
      title={`${project.name} Settings`}
      description={`Configure settings for ${project.name}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <Link
            href={`/dashboard/projects/${project.id}`}
            className={cn(
              "p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors",
              "flex items-center justify-center"
            )}
            aria-label="Back to project"
          >
            <RotateCcw className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage your project configuration</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}
        >
          <div className="border-b border-white/10">
            <nav className="flex -mb-px" aria-label="Settings tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    "relative",
                    activeTab === tab.id
                      ? "text-white border-[#00E5FF]"
                      : "text-zinc-400 hover:text-white hover:border-white/10"
                  )}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 flex-shrink-0">
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="popLayout">
              {activeTab === "general" && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleUpdate}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Project Name</h2>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="my-awesome-app"
                      className={cn(componentStyles.input.base)}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Used for project identification and deployment URLs. Only letters, numbers, hyphens, and underscores allowed.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving || name.trim() === project.name}
                      className={cn(componentStyles.button.primary, "flex items-center gap-2")}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {activeTab === "danger" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(componentStyles.card.base, "border-red-500/20", "p-6")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
                <p className="text-sm text-zinc-500">Irreversible destructive actions</p>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mb-6">
              Once you delete a project, there is no going back. All deployments, environment variables,
              logs, and configuration will be permanently removed. This action cannot be undone.
            </p>

            <ConfirmDialog
              title="Delete Project"
              description={`Are you sure you want to delete "${project.name}"? This will permanently remove all deployments, environment variables, logs, and configuration.`}
              confirmText="Delete Project"
              cancelText="Cancel"
              variant="danger"
              isOpen={showDeleteConfirm}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
              isLoading={isDeleting}
            >
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </Button>
            </ConfirmDialog>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}