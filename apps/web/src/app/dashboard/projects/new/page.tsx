"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Plus, ArrowLeft, GitBranch, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/cloudscale/DashboardLayout";
import { Button } from "@/components/ui/button";
import { validatePassword, PASSWORD_REQUIREMENTS } from "@/lib/password";
import { cn, componentStyles } from "@/lib/design-system";
import { useToast } from "@/components/cloudscale/ToastProvider";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    repository: "",
    branch: "main",
    framework: "Next.js",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.repository.trim()) {
      newErrors.repository = "Repository is required";
    } else if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(formData.repository.trim())) {
      newErrors.repository = "Invalid format. Use 'owner/repo-name'";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name.trim())) {
      newErrors.name = "Use only letters, numbers, hyphens, and underscores";
    }

    if (!formData.branch.trim()) {
      newErrors.branch = "Branch is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          githubRepo: formData.repository.trim(),
          branch: formData.branch.trim(),
          framework: formData.framework,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await res.json();
      addToast({ message: "Project created successfully", type: "success" });
      router.push(`/dashboard/projects/${data.id}`);
    } catch (error) {
      addToast({ message: error instanceof Error ? error.message : "Failed to create project", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="New Project"
      description="Deploy a new application from your GitHub repository."
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/dashboard/projects"
            className={cn(
              "p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors",
              "flex items-center justify-center"
            )}
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <SectionEyebrow>
              <span className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow" />
              Initialize
            </SectionEyebrow>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Create New Project</h1>
            <p className="mt-1 text-zinc-400">
              Connect a GitHub repository and CloudScale will handle the rest
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-6 space-y-6")}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repository */}
            <div>
              <label htmlFor="repository" className="block text-sm font-medium text-zinc-300 mb-1.5">
                GitHub Repository
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="repository"
                  type="text"
                  placeholder="owner/repository"
                  value={formData.repository}
                  onChange={(e) => {
                    setFormData({ ...formData, repository: e.target.value });
                    if (errors.repository) setErrors({ ...errors, repository: "" });
                  }}
                  className={cn(
                    componentStyles.input.base,
                    "pl-9 pr-4",
                    errors.repository && "border-red-500"
                  )}
                />
              </div>
              {errors.repository && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.repository}
                </p>
              )}
              <p className="mt-1.5 text-xs text-zinc-500">
                Format: <code className="font-mono bg-white/5 px-1.5 py-0.5 rounded">owner/repo-name</code>
              </p>
            </div>

            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="my-awesome-app"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={cn(
                  componentStyles.input.base,
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1.5 text-xs text-zinc-500">
                Used for project identification and deployment URLs
              </p>
            </div>

            {/* Branch & Framework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Branch
                </label>
                <input
                  id="branch"
                  type="text"
                  value={formData.branch}
                  onChange={(e) => {
                    setFormData({ ...formData, branch: e.target.value });
                    if (errors.branch) setErrors({ ...errors, branch: "" });
                  }}
                  className={cn(
                    componentStyles.input.base,
                    errors.branch && "border-red-500"
                  )}
                />
                {errors.branch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.branch}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="framework" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Framework
                </label>
                <select
                  id="framework"
                  value={formData.framework}
                  onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                  className={cn(componentStyles.input.base, "appearance-none")}
                >
                  <option value="Next.js">Next.js</option>
                  <option value="Node.js">Node.js</option>
                  <option value="React">React (Vite/CRA)</option>
                  <option value="Vue">Vue (Vite/Nuxt)</option>
                  <option value="Docker">Docker (Custom)</option>
                </select>
              </div>
            </div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300 space-y-1">
                  <p className="font-medium text-white">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>Repository validated and cloned</li>
                    <li>Framework auto-detected (or use selected)</li>
                    <li>Docker image built with optimized layers</li>
                    <li>Container deployed with health checks</li>
                    <li>Live URL provided on success</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Link
                href="/dashboard/projects"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                  "text-zinc-300 hover:text-white transition-colors",
                  "border border-white/10 hover:bg-white/5"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(componentStyles.button.primary, "flex items-center gap-2")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}