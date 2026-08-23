"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Bot,
  Activity,
  Shield,
  Globe,
  GitBranch,
  Cpu,
  Database,
  Layers,
  Key,
  Network,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useScrollReveal, scrollVariants } from "@/hooks/useScrollReveal";

const FEATURES = [
  {
    icon: GitBranch,
    title: "One-Click Deployments",
    description:
      "Connect your GitHub repository and CloudScale automatically builds, containers, and deploys your application on every push — zero configuration required.",
    highlight: "Zero-config GitHub integration",
    category: "core",
  },
  {
    icon: Container,
    title: "Docker-Powered Infrastructure",
    description:
      "Every deployment runs in isolated, production-hardened Docker containers with read-only rootfs, dropped capabilities, and resource limits by default.",
    highlight: "Production-grade isolation",
    category: "core",
  },
  {
    icon: Activity,
    title: "Real-Time Streaming Logs",
    description:
      "Watch your builds and deployments live with SSE-powered log streaming. Filter by level, search instantly, and download logs for debugging.",
    highlight: "SSE-powered live tail",
    category: "observability",
  },
  {
    icon: Bot,
    title: "AI-Powered Debugging",
    description:
      "When a build fails or runtime error occurs, CloudScale's AI analyzes the logs and tells you exactly what broke and how to fix it instantly.",
    highlight: "Instant root cause analysis",
    category: "observability",
  },
  {
    icon: Layers,
    title: "Redis Queue Workers",
    description:
      "A robust BullMQ-powered worker engine manages deployment queues behind the scenes, ensuring reliable, uninterrupted rollouts even under heavy load.",
    highlight: "BullMQ-powered reliability",
    category: "core",
  },
  {
    icon: Shield,
    title: "Hardened Security",
    description:
      "Containers run with read-only rootfs, dropped Linux capabilities, non-root users, seccomp profiles, and strict resource limits by default.",
    highlight: "Production-grade hardening",
    category: "security",
  },
  {
    icon: Globe,
    title: "Global Edge Ready",
    description:
      "Deploy to multiple regions with automatic TLS certificates, custom domains, edge caching, and global load balancing built into the platform.",
    highlight: "Multi-region by default",
    category: "core",
  },
  {
    icon: Key,
    title: "Environment Management",
    description:
      "Secure application configuration with AES-256-GCM encrypted environment variables. Rotate secrets without redeploying. Team-scoped access control.",
    highlight: "AES-256-GCM encryption",
    category: "security",
  },
  {
    icon: Network,
    title: "Deployment History",
    description:
      "Track every release with full audit trail. Compare deployments, rollback instantly, and view detailed metrics for each release.",
    highlight: "Instant rollback",
    category: "observability",
  },
  {
    icon: Cpu,
    title: "Auto-Scaling Workers",
    description:
      "Worker pools automatically scale based on queue depth. Handle traffic spikes without manual intervention or over-provisioning.",
    highlight: "Demand-based scaling",
    category: "core",
  },
  {
    icon: Database,
    title: "PostgreSQL Backed",
    description:
      "All deployment state, logs, and configuration stored in PostgreSQL with ACID guarantees. Reliable state management at scale.",
    highlight: "ACID-compliant state",
    category: "core",
  },
  {
    icon: Monitor,
    title: "Health Checks & Alerts",
    description:
      "Configurable HTTP/TCP health checks with automatic failure detection. Get notified via webhooks when deployments fail or recover.",
    highlight: "Proactive monitoring",
    category: "observability",
  },
] as const;

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "core", label: "Core Platform" },
  { id: "observability", label: "Observability" },
  { id: "security", label: "Security" },
] as const;

export function Features() {
  const [activeCategory, setActiveCategory] = useState<"all" | "core" | "observability" | "security">("all");

  const filteredFeatures = activeCategory === "all"
    ? FEATURES
    : FEATURES.filter(f => f.category === activeCategory);

  const categoryCounts = {
    all: FEATURES.length,
    core: FEATURES.filter(f => f.category === "core").length,
    observability: FEATURES.filter(f => f.category === "observability").length,
    security: FEATURES.filter(f => f.category === "security").length,
  };

  // Scroll reveal for section background
  const { ref: bgRef, isInView: bgInView } = useScrollReveal({ amount: 0.1 });
  
  // Scroll reveal for header
  const { ref: headerRef, isInView: headerInView } = useScrollReveal({ amount: 0.15 });
  
  // Scroll reveal for filter
  const { ref: filterRef, isInView: filterInView } = useScrollReveal({ amount: 0.15, margin: "0px 0px -100px" });
  
  // Scroll reveal for grid - use a wrapper div for detection
  const { ref: gridWrapperRef, isInView: gridInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section id="features" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <motion.div
        ref={bgRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: bgInView ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[#00E5FF]/10 blur-[110px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Features</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything your deployment pipeline needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base leading-relaxed text-zinc-400"
          >
            From first push to production traffic, CloudScale handles the infrastructure,
            queueing, building, monitoring, and debugging — so you can focus on code.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          ref={filterRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: filterInView ? 1 : 0, y: filterInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border border-white/10 bg-white/[0.02] text-zinc-400",
                "hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]",
                "focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50",
                activeCategory === cat.id
                  ? "border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_16px_-4px_rgba(0,229,255,0.3)]"
                  : ""
              )}
            >
              {cat.label}
              <span className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/10 text-zinc-500">
                {categoryCounts[cat.id]}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Features Grid - wrapper for scroll detection */}
        <div ref={gridWrapperRef} className="mt-14">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: gridInView ? 1 : 0, y: gridInView ? 0 : 20 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <FeatureCard feature={feature} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; description: string; highlight: string; category: "core" | "observability" | "security" } }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-500 hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.15)] hover:-translate-y-1">
      {/* Glow Effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00E5FF]/0 blur-2xl transition-all duration-500 group-hover:bg-[#00E5FF]/15"
      />
      
      <div className="flex h-full flex-col">
        {/* Header: Icon + Category Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF] group-hover:bg-gradient-to-br group-hover:from-[#00E5FF]/30 group-hover:to-[#8B5CF6]/30 transition-all duration-300">
            <feature.icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className={cn(
            "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border",
            feature.category === "core" && "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30",
            feature.category === "observability" && "bg-[#00FF9C]/20 text-[#00FF9C] border-[#00FF9C]/30",
            feature.category === "security" && "bg-[#FFCF32]/20 text-[#FFCF32] border-[#FFCF32]/30",
          )}>
            {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
          </span>
        </div>

        {/* Middle: Title + Description */}
        <div className="flex-1 min-h-0">
          <h3 className="font-display text-base font-semibold text-white">
            {feature.title}
          </h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative mt-2 text-sm leading-relaxed text-zinc-400"
          >
            {feature.description}
          </motion.p>
        </div>

        {/* Footer: Highlight + Arrow */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs font-mono text-zinc-500 group-hover:text-[#00E5FF] transition-colors"
          >
            {feature.highlight}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 group-hover:text-[#00E5FF] transition-colors"
          >
            →
          </motion.span>
        </div>
      </div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}