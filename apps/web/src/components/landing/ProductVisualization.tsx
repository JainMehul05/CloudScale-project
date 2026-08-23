"use client";

import { useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Layers,
  Container,
  Rocket,
  Terminal,
  CheckCircle2,
  Bot,
  Activity,
  GitBranch,
  Globe,
  Server,
  Cpu,
  Database,
  Box,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useScrollReveal, scrollVariants } from "@/hooks/useScrollReveal";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const PIPELINE_STAGES = [
  { icon: GitBranch, label: "GitHub", color: "violet" },
  { icon: Layers, label: "Redis Queue", color: "amber" },
  { icon: Activity, label: "Worker", color: "emerald" },
  { icon: Container, label: "Docker", color: "cyan" },
  { icon: Rocket, label: "Deploy", color: "emerald" },
  { icon: Terminal, label: "Logs", color: "cyan" },
  { icon: Bot, label: "AI Debug", color: "violet" },
] as const;

const PIPELINE_CHECKLIST = [
  "Repository cloned",
  "Job queued in Redis",
  "Worker engine started",
  "Docker image built",
  "Container deployed",
  "Streaming logs attached",
  "AI debugging active",
] as const;

const PREVIEW_TABS = ["Overview", "Pipeline"] as const;

interface ArchNodeConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  row: number;
  col: number;
  span?: number;
}

const ARCHITECTURE_NODES: ArchNodeConfig[] = [
  { id: "github", label: "GitHub", icon: GitBranch, color: "violet", row: 0, col: 0 },
  { id: "api", label: "API Server", icon: Server, color: "blue", row: 0, col: 1 },
  { id: "redis", label: "Redis Queue", icon: Database, color: "amber", row: 0, col: 2 },
  { id: "worker", label: "Worker", icon: Cpu, color: "emerald", row: 0, col: 3 },
  { id: "docker", label: "Docker Engine", icon: Container, color: "cyan", row: 1, col: 1, span: 2 },
  { id: "container", label: "Container Runtime", icon: Box, color: "sky", row: 2, col: 1, span: 2 },
];

const ARCHITECTURE_EDGES: { from: string; to: string }[] = [
  { from: "github", to: "api" },
  { from: "api", to: "redis" },
  { from: "redis", to: "worker" },
  { from: "api", to: "docker" },
  { from: "docker", to: "container" },
];

const colorMap = {
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

const newColorMap = {
  violet: "text-[#A78BFA] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
  blue: "text-[#2563FF] bg-[#2563FF]/10 border-[#2563FF]/20",
  amber: "text-[#FFCF32] bg-[#FFCF32]/10 border-[#FFCF32]/20",
  emerald: "text-[#00FF9C] bg-[#00FF9C]/10 border-[#00FF9C]/20",
  cyan: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20",
  sky: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20",
};

export function ProductVisualization() {
  const [tab, setTab] = useState<"Overview" | "Pipeline" | "Architecture">("Overview");
  
  // Scroll reveals
  const { ref: sectionRef, isInView: sectionInView } = useScrollReveal({ amount: 0.3 });
  const { ref: pipelineRef, isInView: pipelineInView } = useScrollReveal({ amount: 0.2 });
  const { ref: archRef, isInView: archInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section id="technology" className="relative scroll-mt-24 px-4 pb-32 sm:px-6 lg:px-8">
      <motion.div
        ref={sectionRef}
        initial="hidden"
        animate={{ opacity: sectionInView ? 1 : 0, y: sectionInView ? 0 : 24 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5FF]/10 blur-[110px]"
        />

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_50px_100px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          {/* Window Chrome */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFCF32]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9C]/70" />
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
              <Terminal className="h-3.5 w-3.5" />
              cloudscale — deployments
            </div>
            <div className="flex gap-1 rounded-md border border-white/10 bg-black/40 p-0.5">
              {PREVIEW_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                    tab === t
                      ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Strip */}
          <div className="border-b border-white/10 bg-black/20 px-4 py-4 sm:px-6">
            <motion.div
              ref={pipelineRef}
              initial="hidden"
              animate={{ opacity: pipelineInView ? 1 : 0, y: pipelineInView ? 0 : 24 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              variants={staggerContainer}
              className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:gap-1"
            >
              {PIPELINE_STAGES.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-1 items-center gap-1 last:flex-none min-w-[40px] sm:min-w-0"
                >
                  <div className="flex w-full flex-col items-center gap-1.5">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      newColorMap[stage.color as keyof typeof newColorMap] || colorMap[stage.color as keyof typeof colorMap]
                    )}>
                      <stage.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                    <span className="hidden text-center text-[10px] leading-tight text-zinc-500 sm:block">
                      {stage.label}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="hidden h-px flex-1 bg-gradient-to-r from-white/15 to-white/5 sm:block" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {tab === "Overview" ? (
            <div className="grid gap-0 md:grid-cols-5">
              {/* Status Panel */}
              <div className="border-b border-white/10 p-6 md:col-span-2 md:border-b-0 md:border-r">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Deployment
                </p>
                <p className="font-display mt-1 text-lg font-semibold text-white">
                  portfolio-app
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF9C] opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00FF9C]" />
                  </span>
                  <span className="text-sm font-medium text-[#00FF9C]">Running</span>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Docker Build</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00FF9C]"
                    />
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-zinc-500">Branch</dt>
                    <dd className="mt-1 font-mono text-zinc-300">main</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Region</dt>
                    <dd className="mt-1 font-mono text-zinc-300">us-east-1</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Commit</dt>
                    <dd className="mt-1 font-mono text-zinc-300">a1c4f9e</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Runtime</dt>
                    <dd className="mt-1 font-mono text-zinc-300">Docker</dd>
                  </div>
                </dl>
              </div>

              {/* Pipeline Checklist Panel */}
              <div className="bg-black/40 p-6 md:col-span-3">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Deployment Pipeline
                </p>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="mt-3 space-y-2.5 font-mono text-[13px] leading-relaxed"
                >
                  {PIPELINE_CHECKLIST.map((line, i) => (
                    <motion.p
                      key={line}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-center gap-2 text-zinc-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00FF9C]" />
                      {line}
                    </motion.p>
                  ))}
                  <motion.p
                    variants={fadeUp}
                    custom={PIPELINE_CHECKLIST.length}
                    className="flex items-center gap-1.5 pt-1 text-zinc-500"
                  >
                    <span>$ live at portfolio-app.cloudscale.app</span>
                    <span className="inline-block h-3.5 w-1.5 animate-pulse bg-zinc-500" />
                  </motion.p>
                </motion.div>
              </div>
            </div>
          ) : tab === "Pipeline" ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">Pipeline Stages</h3>
                  <div className="space-y-3">
                    {PIPELINE_STAGES.map((stage, i) => (
                      <motion.div
                        key={stage.label}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all duration-300"
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border",
                          newColorMap[stage.color as keyof typeof newColorMap] || colorMap[stage.color as keyof typeof colorMap]
                        )}>
                          <stage.icon className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{stage.label}</p>
                          <p className="text-xs text-zinc-500">
                            {[
                              "Source code repository",
                              "Job queue management",
                              "Background worker",
                              "Container builds",
                              "Production deployment",
                              "Live log streaming",
                              "AI error analysis",
                            ][i]}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">Architecture Flow</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      "GitHub → Webhook triggers API",
                      "API → Enqueues job in Redis",
                      "Worker → Dequeues and processes",
                      "Worker → Builds Docker image",
                      "Worker → Deploys container",
                      "Container → Streams logs via SSE",
                      "AI → Analyzes errors in real-time",
                    ].map((step, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 text-zinc-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00FF9C]" />
                        {step}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">System Components</h3>
                  <div className="space-y-3">
                    {ARCHITECTURE_NODES.map((node, i) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all duration-300"
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border",
                          newColorMap[node.color as keyof typeof newColorMap] || colorMap[node.color as keyof typeof colorMap]
                        )}>
                          <node.icon className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{node.label}</p>
                          <p className="text-xs text-zinc-500">Core infrastructure component</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">Data Flow</h3>
                  <div className="space-y-2 text-sm">
                    {ARCHITECTURE_EDGES.map((edge, i) => {
                      const fromNode = ARCHITECTURE_NODES.find((n) => n.id === edge.from);
                      const toNode = ARCHITECTURE_NODES.find((n) => n.id === edge.to);
                      return (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-2 text-zinc-300"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
                          {fromNode?.label} → {toNode?.label}
                        </motion.p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Architecture Visualization - CSS Grid Layout */}
        <motion.div
          ref={archRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: archInView ? 1 : 0, y: archInView ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-8 backdrop-blur-xl"
        >
          <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-8">CloudScale Architecture</h3>

          {/* Desktop: CSS Grid Flow Layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* SVG Connections - rendered behind nodes */}
              <ArchFlowConnections nodes={ARCHITECTURE_NODES} edges={ARCHITECTURE_EDGES} flowInView={archInView} />

              {/* Grid Container for Nodes - 4 columns for top row */}
              <div className="relative grid grid-cols-4 gap-6 items-start">
                {ARCHITECTURE_NODES.map((nodeConfig, index) => {
                  const colSpan = nodeConfig.span || 1;
                  const colStart = nodeConfig.col + 1;
                  const rowStart = nodeConfig.row + 1;

                  return (
                    <motion.div
                      key={nodeConfig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: archInView ? 1 : 0, y: archInView ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        gridColumn: `${colStart} / span ${colSpan}`,
                        gridRow: rowStart,
                      }}
                      className="relative flex justify-center"
                    >
                      <ArchFlowNode node={nodeConfig} colorMap={newColorMap} size={nodeConfig.span ? "xl" : "lg"} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tablet: 2-column layout */}
          <div className="lg:hidden xl:block">
            <div className="grid grid-cols-2 gap-4">
              {ARCHITECTURE_NODES.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: archInView ? 1 : 0, y: archInView ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex justify-center"
                >
                  <ArchFlowNode node={node} colorMap={newColorMap} size="md" />
                  {index < ARCHITECTURE_NODES.length - 1 && node.row < ARCHITECTURE_NODES.length - 1 && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-[2px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] opacity-50" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical Stack */}
          <div className="xl:hidden">
            <div className="space-y-4">
              {ARCHITECTURE_NODES.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: archInView ? 1 : 0, y: archInView ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex justify-center"
                >
                  <ArchFlowNode node={node} colorMap={newColorMap} size="md" />
                  {index < ARCHITECTURE_NODES.length - 1 && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-[2px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] opacity-50" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ArchFlowNode({ node, colorMap, size = "md" }: {
  node: ArchNodeConfig;
  colorMap: Record<string, string>;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: { icon: "h-5 w-5", box: "h-10 w-10", text: "text-xs px-3 py-2", gap: "gap-1.5" },
    md: { icon: "h-6 w-6", box: "h-12 w-12", text: "text-sm px-4 py-2.5", gap: "gap-2" },
    lg: { icon: "h-5 w-5", box: "h-10 w-10", text: "text-[11px] px-2.5 py-2", gap: "gap-1.5" },
    xl: { icon: "h-7 w-7", box: "h-14 w-14", text: "text-sm px-5 py-3", gap: "gap-2.5" },
  };

  const s = sizes[size];
  const colorClasses = colorMap[node.color as keyof typeof colorMap] || "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20";

  return (
    <div className={cn(
      "relative flex flex-col items-center",
      s.gap,
      size === "xl" && "min-w-[240px]",
      size !== "xl" && "min-w-[140px]",
    )}>
      <div className={cn(
        "inline-flex items-center justify-center rounded-xl border bg-white/[0.02] backdrop-blur-sm",
        "transition-all duration-300 hover:scale-105",
        colorClasses,
        s.box,
      )}>
        <node.icon className={cn(s.icon, "stroke-[1.75]")} />
      </div>
      <span className={cn(
        "font-mono font-medium text-white whitespace-nowrap text-center",
        s.text,
      )}>
        {node.label}
      </span>
    </div>
  );
}

function ArchFlowConnections({ nodes, edges, flowInView }: {
  nodes: ArchNodeConfig[];
  edges: { from: string; to: string }[];
  flowInView: boolean;
}) {
  // Calculate grid cell centers for connection paths
  const cellCenters: Record<string, { x: number; y: number }> = {};

  // Grid: 4 columns, gap-6 (1.5rem = 24px), container width ~100%
  nodes.forEach((node) => {
    const colWidth = 25; // percentage per column
    const gap = 1.5; // rem equivalent in %
    const colStart = node.col;
    const colSpan = node.span || 1;
    const row = node.row;

    // Approximate center calculation
    const x = colStart * (colWidth + gap) + (colSpan * colWidth) / 2 + (colSpan - 1) * gap / 2;
    const y = row * 35 + 15; // row height approximation

    cellCenters[node.id] = { x, y };
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none -z-10"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="archEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#2563FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <marker id="archArrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="url(#archEdgeGradient)" />
        </marker>
      </defs>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: flowInView ? 1 : 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {edges.map((edge, index) => {
          const from = cellCenters[edge.from];
          const to = cellCenters[edge.to];

          if (!from || !to) return null;

          // Create curved path
          const ctrlX = (from.x + to.x) / 2;
          const ctrlY = Math.min(from.y, to.y) - 8;

          return (
            <motion.path
              key={`${edge.from}-${edge.to}`}
              d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
              stroke="url(#archEdgeGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#archArrowhead)"
              opacity={0.7}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: flowInView ? 1 : 0 }}
              transition={{ duration: 1.5, delay: 0.5 + index * 0.15, ease: "easeOut" }}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}