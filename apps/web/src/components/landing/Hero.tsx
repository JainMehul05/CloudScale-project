"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GitBranch,
  ArrowRight,
  Terminal,
  Server,
  Globe,
  CheckCircle2,
  Loader2,
  Box,
  Rocket,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useMousePosition, useReducedMotion } from "@/hooks/useMousePosition";

const GITHUB_URL = "https://github.com/JainMehul05/CloudScale-project";

function MouseFollowGlow({ className, intensity = 1, color = "cyan" }: { className?: string; intensity?: number; color?: "cyan" | "purple" | "blue" }) {
  const { normalizedX, normalizedY } = useMousePosition();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  const x = `${50 + normalizedX * 15 * intensity}%`;
  const y = `${50 + normalizedY * 15 * intensity}%`;

  const colors = {
    cyan: "bg-[#00E5FF]/20",
    purple: "bg-[#8B5CF6]/20",
    blue: "bg-[#2563FF]/20",
  };

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-[110px] transition-all duration-300 ease-out", colors[color], className ?? "")}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        willChange: "transform",
      }}
    />
  );
}

function GridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-grid"
      style={{
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)",
      }}
    />
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  href = "#",
  icon,
  external = false,
  className = "",
  size = "default",
}: {
  children: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  external?: boolean;
  className?: string;
  size?: "default" | "lg";
}) {
  const sizes = {
    default: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl",
        "bg-gradient-to-b from-[#00E5FF] to-[#2563FF]",
        "hover:from-[#00B8D4] hover:to-[#1E40AF]",
        sizes[size],
        "font-semibold text-white",
        "shadow-[0_0_24px_-6px_rgba(0,229,255,0.4)]",
        "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-[#2563FF] to-[#8B5CF6] bg-[length:200%_100%] animate-shimmer opacity-20" />
      <span className="relative flex items-center gap-2">
        {children}
        {icon && (
          <span className="relative transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
    </Link>
  );
}

function SecondaryButton({
  children,
  href = "#",
  icon,
  external = false,
  className = "",
  size = "default",
}: {
  children: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  external?: boolean;
  className?: string;
  size?: "default" | "lg";
}) {
  const sizes = {
    default: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02]",
        sizes[size],
        "font-semibold text-zinc-200 backdrop-blur-sm",
        "transition-all duration-200 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] sm:w-auto",
        className
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function FloatingParticle({ delay = 0, duration = 20, x = 0, y = 0, size = 4, color = "#00E5FF" }: { 
  delay?: number; 
  duration?: number; 
  x?: number; 
  y?: number; 
  size?: number; 
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
        position: "absolute",
        pointerEvents: "none",
        filter: "blur(1px)",
      }}
    />
  );
}

const DEPLOYMENT_STAGES = [
  { id: "repo", label: "GitHub", icon: GitBranch, color: "text-[#A78BFA]", bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/30" },
  { id: "queue", label: "Queue", icon: Box, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/30" },
  { id: "build", label: "Build", icon: Loader2, color: "text-[#FFCF32]", bg: "bg-[#FFCF32]/10", border: "border-[#FFCF32]/30" },
  { id: "deploy", label: "Deploy", icon: Rocket, color: "text-[#00FF9C]", bg: "bg-[#00FF9C]/10", border: "border-[#00FF9C]/30" },
  { id: "running", label: "Running", icon: Server, color: "text-[#00FF9C]", bg: "bg-[#00FF9C]/10", border: "border-[#00FF9C]/30" },
  { id: "logs", label: "Logs", icon: Terminal, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/30" },
] as const;

const PIPELINE_LOGS = [
  { prefix: "$", text: "Initializing CloudScale deployment...", type: "info" },
  { prefix: "$", text: "Connecting to GitHub API...", type: "info" },
  { prefix: "$", text: "Repository cloned successfully", type: "success" },
  { prefix: "$", text: "Building Docker image with BuildKit...", type: "info" },
  { prefix: "$", text: "FROM node:20-alpine AS builder", type: "dim" },
  { prefix: "$", text: "COPY package*.json ./", type: "dim" },
  { prefix: "$", text: "RUN npm ci --production", type: "dim" },
  { prefix: "$", text: "Multi-stage build completed", type: "success" },
  { prefix: "$", text: "Image built: sha256:a1b2c3d4e5f6", type: "success" },
  { prefix: "$", text: "Starting hardened container...", type: "info" },
  { prefix: "$", text: "Container started on port 3000", type: "success" },
  { prefix: "$", text: "Health check passed ✓", type: "success" },
  { prefix: "$", text: "Application live at https://my-app.cloudscale.dev", type: "link" },
] as const;

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <MouseFollowGlow className="h-[600px] w-[900px]" intensity={1.2} color="cyan" />
      <MouseFollowGlow className="h-[400px] w-[400px] left-1/4 top-40" intensity={0.8} color="purple" />
      <MouseFollowGlow className="h-[300px] w-[300px] right-1/4 top-64" intensity={0.6} color="blue" />
      
      <GridBackground />
      
      {/* Floating Particles */}
      {!reducedMotion && (
        <>
          <FloatingParticle delay={0} duration={15} x={10} y={20} size={3} color="#00E5FF" />
          <FloatingParticle delay={2} duration={18} x={85} y={15} size={2} color="#8B5CF6" />
          <FloatingParticle delay={4} duration={20} x={20} y={80} size={4} color="#00E5FF" />
          <FloatingParticle delay={6} duration={16} x={90} y={75} size={3} color="#8B5CF6" />
          <FloatingParticle delay={1} duration={22} x={50} y={50} size={2} color="#2563FF" />
        </>
      )}

      <div className="relative mx-auto max-w-5xl">
        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionEyebrow>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow"
              />
              Cloud Infrastructure OS
            </SectionEyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            <span className="block">Deploy.</span>
            <span className="block">Scale.</span>
            <span className="block bg-gradient-to-r from-[#00E5FF] via-[#2563FF] to-[#A78BFA] bg-clip-text text-transparent">
              Dominate the Cloud.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
          >
            AI-powered cloud deployment infrastructure for modern developers. 
            Push code, get global containers, real-time logs, and instant debugging — automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row"
          >
            <PrimaryButton href="/auth/signin" icon={<ArrowRight className="h-5 w-5" />} size="lg">
              Start Deploying Free
            </PrimaryButton>
            <SecondaryButton
              href={GITHUB_URL}
              external
              icon={<GitBranch className="h-5 w-5" />}
              size="lg"
            >
              View Source on GitHub
            </SecondaryButton>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, repeat: Infinity, repeatType: "reverse" }}
                className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow"
              />
              <span className="text-sm font-medium text-zinc-300">All systems operational</span>
            </div>
            <div className="hidden sm:flex h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500">
              <Zap className="h-4 w-4 text-[#FFCF32]" />
              <span className="text-sm font-medium">Sub-60s deployments</span>
            </div>
            <div className="hidden sm:flex h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500">
              <Globe className="h-4 w-4 text-[#A78BFA]" />
              <span className="text-sm font-medium">12 global regions</span>
            </div>
            <div className="hidden sm:flex h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500">
              <Shield className="h-4 w-4 text-[#FF3366]" />
              <span className="text-sm font-medium">Zero-config security</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Visualization - Interactive Deployment Flow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative mx-auto max-w-6xl"
        >
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-1">
            <div className="rounded-xl bg-[#080808]/80 p-6 backdrop-blur-xl overflow-hidden">
              {/* Animated Grid Lines */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-grid-cyan opacity-50"
                style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)" }}
              />

              {/* Pipeline Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6 relative z-10"
              >
                <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                  {DEPLOYMENT_STAGES.map((stage, index) => (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="flex items-center gap-2 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300",
                          stage.bg,
                          stage.border,
                          stage.color,
                          "group-hover:border-[length:200%_100%] group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:to-[#2563FF]"
                        )}
                      >
                        <stage.icon className="h-5 w-5" />
                      </motion.div>
                      <span className="hidden sm:block text-sm font-medium text-white">{stage.label}</span>
                      {index < DEPLOYMENT_STAGES.length - 1 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "50px" }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                          className="h-px flex-1 max-w-[50px] bg-gradient-to-r from-white/15 to-white/5"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Live Terminal Animation */}
              <div className="relative rounded-lg border border-white/10 bg-[#050508] overflow-hidden z-10">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFCF32]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9C]/70" />
                  </div>
                  <div className="text-center text-xs text-zinc-500 font-mono">deployment.log</div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 300, repeat: Infinity, repeatType: "reverse" }}
                      className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow"
                    />
                    <span className="text-xs text-[#00FF9C] font-mono">LIVE</span>
                  </div>
                </div>
                <pre className="text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto p-4 max-h-72 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    {PIPELINE_LOGS.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.06, duration: 0.3 }}
                        className="flex items-baseline gap-2"
                      >
                        <span className={cn("text-zinc-500 font-mono", log.type === "dim" && "text-zinc-600", log.type === "success" && "text-[#00FF9C]", log.type === "link" && "text-[#00E5FF]")}>
                          {log.prefix}
                        </span>
                        <span className={cn("whitespace-pre-wrap", log.type === "dim" && "text-zinc-600", log.type === "success" && "text-[#00CC7D]", log.type === "link" && "text-[#00B8D4] underline", log.type === "info" && "text-zinc-200")}>
                          {log.text}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </pre>
              </div>

              {/* Live URL Result */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8 }}
                className="mt-4 p-4 rounded-lg border border-[#00FF9C]/30 bg-[#00FF9C]/10 flex items-center justify-between gap-4 z-10"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#00FF9C] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Deployment Ready</p>
                    <p className="font-mono text-sm text-[#00FF9C]">https://my-app.cloudscale.dev</p>
                  </div>
                </div>
                <Globe className="h-5 w-5 text-[#00FF9C] flex-shrink-0" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}