"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, DeploymentStatus } from "./StatusBadge";
import { cn, componentStyles } from "@/lib/design-system";
import { GitBranch, Clock, Play, Trash2, Settings, Loader2, Zap, Globe } from "lucide-react";

export interface ProjectData {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  port: number;
  createdAt: Date | string;
  latestDeployment?: {
    id: string;
    status: DeploymentStatus;
    createdAt: Date | string;
    liveUrl?: string | null;
    deploymentUrl?: string | null;
  } | null;
  deploymentCount?: number;
}

export interface ProjectCardProps {
  project: ProjectData;
  className?: string;
  onDeploy?: (projectId: string) => void;
  onSettings?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onViewDeployment?: (deploymentId: string) => void;
  variant?: "default" | "compact";
}

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function extractRepoInfo(githubRepo: string): { owner: string; repo: string } | null {
  const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function ProjectCard({
  project,
  className,
  onDeploy,
  onSettings,
  onDelete,
  onViewDeployment,
  variant = "default",
}: ProjectCardProps) {
  const repoInfo = extractRepoInfo(project.githubRepo);
  const latestDeployment = project.latestDeployment;
  const deploymentStatus = latestDeployment?.status ?? "STOPPED";

  const baseStyles = cn(
    componentStyles.card.base,
    componentStyles.card.hover,
    componentStyles.card.elevated,
    "overflow-hidden transition-all duration-300",
    className
  );

  if (variant === "compact") {
    return (
      <div className={cn(baseStyles, "p-4 flex items-center justify-between gap-4")}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 border border-white/10 flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{project.name}</p>
            <p className="text-xs text-zinc-500 truncate">
              {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : project.githubRepo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={deploymentStatus} showDot />
          {latestDeployment && (
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {formatRelativeTime(latestDeployment.createdAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={baseStyles}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 border border-white/10 flex items-center justify-center shrink-0">
              <GitBranch className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <GitBranch className="w-3 h-3" />
                <span className="truncate max-w-[300px]">
                  {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : project.githubRepo}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-zinc-400">branch: {project.branch}</span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-zinc-400">port: {project.port}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={deploymentStatus} />
          </div>
        </div>
      </CardHeader>

      {latestDeployment && (
        <div className="px-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Latest Deployment</p>
                <p className="font-mono text-sm text-zinc-300">
                  {latestDeployment.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 hidden sm:inline">
                {formatRelativeTime(latestDeployment.createdAt)}
              </span>
              {latestDeployment.liveUrl && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => window.open(latestDeployment.liveUrl!, "_blank")}
                  className="text-zinc-400 hover:text-[#00E5FF]"
                  aria-label="Open live URL"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              )}
              {latestDeployment.deploymentUrl && onViewDeployment && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewDeployment(latestDeployment.id)}
                  className="text-zinc-400 hover:text-[#00E5FF]"
                  aria-label="View deployment details"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              Created {formatRelativeTime(project.createdAt)}
            </span>
            {project.deploymentCount !== undefined && (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Zap className="w-3.5 h-3.5" />
                {project.deploymentCount} deployment{project.deploymentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pb-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onDeploy?.(project.id)}
            disabled={deploymentStatus === "BUILDING" || deploymentStatus === "STARTING" || deploymentStatus === "HEALTH_CHECK"}
          >
            {deploymentStatus === "BUILDING" || deploymentStatus === "STARTING" || deploymentStatus === "HEALTH_CHECK" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Deploy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSettings?.(project.id)}
            className="text-zinc-400 hover:text-white"
            aria-label="Project settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete?.(project.id)}
            className="text-zinc-400 hover:text-[#FF3366]"
            aria-label="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}