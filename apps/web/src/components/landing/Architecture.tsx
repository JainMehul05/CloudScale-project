"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  Server,
  Cpu,
  Container,
  Box,
  Globe,
  Shield,
  Zap,
  Network,
  Lock,
  Monitor,
  ArrowRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ARCH_LAYERS = [
  {
    id: "developer",
    label: "Developer Experience",
    icon: GitBranch,
    color: "violet",
    description: "GitHub integration, CLI, dashboard, API",
    components: ["GitHub OAuth", "Webhooks", "CLI Tool", "Dashboard UI", "REST API"],
  },
  {
    id: "api",
    label: "API Gateway",
    icon: Server,
    color: "blue",
    description: "Authentication, rate limiting, request routing",
    components: ["NextAuth v5", "Rate Limiting", "Request Validation", "WebSocket Proxy"],
  },
  {
    id: "queue",
    label: "Job Queue",
    icon: Layers,
    color: "amber",
    description: "Redis-backed BullMQ for reliable job processing",
    components: ["BullMQ", "Redis Cluster", "Priority Queues", "Retry Logic", "Dead Letter Queue"],
  },
  {
    id: "worker",
    label: "Worker Engine",
    icon: Cpu,
    color: "emerald",
    description: "Scalable worker pools with auto-scaling",
    components: ["Worker Pools", "Auto-scaling", "Concurrency Control", "Resource Limits", "Health Monitoring"],
  },
  {
    id: "build",
    label: "Build System",
    icon: Container,
    color: "cyan",
    description: "Docker BuildKit with multi-stage builds and caching",
    components: ["BuildKit", "Multi-stage Builds", "Layer Caching", "Security Scanning", "SBOM Generation"],
  },
  {
    id: "runtime",
    label: "Container Runtime",
    icon: Box,
    color: "sky",
    description: "Hardened containers with security by default",
    components: ["Docker Engine", "Read-only Rootfs", "Seccomp Profiles", "Non-root User", "Resource Limits"],
  },
  {
    id: "network",
    label: "Networking",
    icon: Globe,
    color: "violet",
    description: "Global load balancing, TLS, custom domains",
    components: ["Load Balancer", "Auto TLS", "Custom Domains", "Edge Caching", "Geo-routing"],
  },
  {
    id: "observability",
    label: "Observability",
    icon: Monitor,
    color: "violet",
    description: "Logs, metrics, alerts, and AI debugging",
    components: ["SSE Logs", "Metrics", "Health Checks", "AI Diagnosis", "Alerts"],
  },
] as const;

const TECH_STACK = [
  { category: "Frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion"] },
  { category: "Backend", items: ["Next.js API Routes", "NextAuth v5", "Prisma ORM", "PostgreSQL", "Redis"] },
  { category: "Infrastructure", items: ["Docker Engine", "BuildKit", "BullMQ", "Dockerode", "Linux Namespaces"] },
  { category: "Observability", items: ["SSE", "PostgreSQL Logs", "Prometheus Metrics", "AI Diagnosis", "Health Checks"] },
] as const;

const SECURITY_FEATURES = [
  { icon: Lock, title: "Encrypted Secrets", desc: "AES-256-GCM encryption for all environment variables at rest" },
  { icon: Shield, title: "Container Hardening", desc: "Read-only rootfs, dropped capabilities, seccomp, non-root user" },
  { icon: Network, title: "Network Isolation", desc: "Container network namespaces, egress controls, mTLS" },
  { icon: Globe, title: "Auto TLS", desc: "Automatic Let's Encrypt certificates with auto-renewal" },
  { icon: Monitor, title: "Audit Logging", desc: "Immutable audit trail for all deployment actions" },
  { icon: Zap, title: "Zero-Downtime Deploys", desc: "Blue-green deployments with health check validation" },
] as const;

const colorMap = {
  violet: "text-[#A78BFA] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
  blue: "text-[#2563FF] bg-[#2563FF]/10 border-[#2563FF]/20",
  amber: "text-[#FFCF32] bg-[#FFCF32]/10 border-[#FFCF32]/20",
  emerald: "text-[#00FF9C] bg-[#00FF9C]/10 border-[#00FF9C]/20",
  cyan: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20",
  sky: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20",
};

type FlowNodeConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  row: number;
  col: number;
  span?: number;
};

const FLOW_NODES_DESKTOP: FlowNodeConfig[] = [
  { id: "developer", label: "GitHub", icon: GitBranch, color: "violet", row: 0, col: 0 },
  { id: "api", label: "API Server", icon: Server, color: "blue", row: 0, col: 1 },
  { id: "queue", label: "Redis Queue", icon: Layers, color: "amber", row: 0, col: 2 },
  { id: "worker", label: "Worker", icon: Cpu, color: "emerald", row: 0, col: 3 },
  { id: "build", label: "Docker Engine", icon: Container, color: "cyan", row: 1, col: 1, span: 2 },
  { id: "runtime", label: "Container Runtime", icon: Box, color: "sky", row: 2, col: 0 },
  { id: "network", label: "Networking", icon: Globe, color: "violet", row: 2, col: 1 },
  { id: "observability", label: "Observability", icon: Monitor, color: "violet", row: 2, col: 2 },
];

export function Architecture() {
  const { ref: bgRef, isInView: bgInView } = useScrollReveal({ amount: 0.1 });
  const { ref: headerRef, isInView: headerInView } = useScrollReveal({ amount: 0.15 });
  const { ref: layersRef, isInView: layersInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: flowRef, isInView: flowInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: techRef, isInView: techInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: securityRef, isInView: securityInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section id="architecture" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
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
          <SectionEyebrow>Architecture</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Built for scale, security, and developer velocity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base leading-relaxed text-zinc-400"
          >
            Every layer is designed for production workloads — from the API gateway down to the container runtime.
          </motion.p>
        </motion.div>

        {/* Architecture Layers - Vertical Stack */}
        <motion.div
          ref={layersRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: layersInView ? 1 : 0, y: layersInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 space-y-4"
        >
          {ARCH_LAYERS.map((layer, index) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: layersInView ? 1 : 0, x: layersInView ? 0 : (index % 2 === 0 ? -30 : 30) }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className={cn(
                "relative p-6 rounded-2xl border bg-white/[0.02] transition-all duration-300",
                "hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.15)] hover:-translate-y-1",
                index % 2 === 0 ? "border-l-4" : "border-r-4",
                colorMap[layer.color as keyof typeof colorMap]?.split(" ")[1] ? colorMap[layer.color as keyof typeof colorMap] : "border-[#00E5FF]/30"
              )}>
                <div className="grid grid-cols-[64px_auto_80px_minmax(220px,1fr)_auto] gap-4 items-start">
                  <div className={cn(
                    "flex-shrink-0 h-12 w-12 items-center justify-center rounded-lg border",
                    "bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20",
                    colorMap[layer.color as keyof typeof colorMap]
                  )}>
                    <layer.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-white">{layer.label}</h3>
                  </div>
                  
                  <div className="flex items-start">
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full whitespace-nowrap",
                      colorMap[layer.color as keyof typeof colorMap]
                    )}>
                      Layer {ARCH_LAYERS.indexOf(layer) + 1}
                    </span>
                    <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-[#00E5FF] transition-colors ml-2 flex-shrink-0" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-400">{layer.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {layer.components.map((comp, i) => (
                      <motion.span
                        key={comp}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-400 hover:border-[#00E5FF]/30 hover:bg-white/[0.04] hover:text-[#00E5FF] transition-all"
                      >
                        {comp}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
              
              {(index < ARCH_LAYERS.length - 1) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: layersInView ? "24px" : 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-[calc(50%+24px)] top-full w-[2px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] hidden lg:block"
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Request Flow Visualization - CSS Grid Layout */}
        <motion.div
          ref={flowRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: flowInView ? 1 : 0, y: flowInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-8">Request Flow</h3>
          
          {/* Desktop: CSS Grid Flow Layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* SVG Connections - rendered behind nodes */}
              <FlowConnections nodes={FLOW_NODES_DESKTOP} flowInView={flowInView} />
              
              {/* Grid Container for Nodes */}
              <div className="relative grid grid-cols-4 gap-6 items-start">
                {FLOW_NODES_DESKTOP.map((nodeConfig, index) => {
                  const layer = ARCH_LAYERS.find(l => l.id === nodeConfig.id);
                  if (!layer) return null;
                  
                  const colSpan = nodeConfig.span || 1;
                  const colStart = nodeConfig.col + 1;
                  
                  return (
                    <motion.div
                      key={nodeConfig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: flowInView ? 1 : 0, y: flowInView ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                      className="relative"
                    >
                      <FlowNode layer={layer} colorMap={colorMap} size={nodeConfig.span ? "xl" : "lg"} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tablet: 2-column layout */}
          <div className="lg:hidden xl:block">
            <div className="grid grid-cols-2 gap-4">
              {ARCH_LAYERS.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: flowInView ? 1 : 0, y: flowInView ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <FlowNode layer={layer} colorMap={colorMap} size="md" />
                  {index < ARCH_LAYERS.length - 1 && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-[2px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] opacity-50" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical Stack */}
          <div className="xl:hidden">
            <div className="space-y-4">
              {ARCH_LAYERS.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: flowInView ? 1 : 0, y: flowInView ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <FlowNode layer={layer} colorMap={colorMap} size="md" />
                  {index < ARCH_LAYERS.length - 1 && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-[2px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] opacity-50" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          ref={techRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: techInView ? 1 : 0, y: techInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-8 text-center">Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH_STACK.map((stack, index) => (
              <motion.div
                key={stack.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: techInView ? 1 : 0, y: techInView ? 0 : 20 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "p-6 rounded-2xl border bg-white/[0.02] transition-all duration-300",
                  "hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.1)]"
                )}
              >
                <h4 className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">{stack.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item, i) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: techInView ? 1 : 0, scale: techInView ? 1 : 0.9 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-sm font-mono text-zinc-300 hover:border-[#00E5FF]/30 hover:bg-white/[0.04] hover:text-[#00E5FF] transition-all"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          ref={securityRef}
          id="security"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: securityInView ? 1 : 0, y: securityInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-8 text-center">Security by Default</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: securityInView ? 1 : 0, y: securityInView ? 0 : 20 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "p-6 rounded-2xl border bg-white/[0.02] transition-all duration-300",
                  "hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.1)]"
                )}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF] mb-4">
                  <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h4 className="font-display text-base font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FlowNode({ layer, colorMap, size = "md" }: { 
  layer: { id: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string; description: string; components: readonly string[] }; 
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
  const colorClasses = colorMap[layer.color as keyof typeof colorMap] || "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20";

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
        <layer.icon className={cn(s.icon, "stroke-[1.75]")} />
      </div>
      <span className={cn(
        "font-mono font-medium text-white whitespace-nowrap text-center",
        s.text,
      )}>
        {layer.label}
      </span>
      {size === "xl" && (
        <p className="text-xs text-zinc-400 text-center max-w-[240px] mt-1">{layer.description}</p>
      )}
    </div>
  );
}

function FlowConnections({ nodes, flowInView }: { nodes: FlowNodeConfig[]; flowInView: boolean }) {
  // Calculate grid cell centers for connection paths matching CSS Grid layout
  // Grid: 4 columns (1fr each), gap-6 (1.5rem), container width 100%
  // Column centers in percentage (accounting for gaps): 
  // Each column = 25% width, gap = ~1.5% of container (assuming 1200px container, 24px gap = 2%)
  // More precise: 4 columns * 25% = 100%, 3 gaps * 2% = 6%, so total = 106%
  // Actually, gap-6 in Tailwind is 1.5rem. In a percentage-based grid, gaps are part of the grid track.
  // Better approach: use the same calculation as CSS grid auto-placement
  
  const cellCenters: Record<string, { x: number; y: number }> = {};
  
  // Calculate positions based on CSS Grid layout
  // 4 equal columns with gap-6 (1.5rem)
  // In CSS Grid with grid-cols-4 and gap-6:
  // Each column track = 1fr, gaps are fixed
  // We'll use percentage-based calculation that matches the visual layout
  
  nodes.forEach((node) => {
    const colStart = node.col;
    const colSpan = node.span || 1;
    const row = node.row;
    
    // Column centers for 4-column grid with gap-6
    // Each column is 1fr, gaps are between columns
    // Total grid width = 100%
    // 4 columns + 3 gaps = 4fr + 3*gap
    // fr unit = (100% - 3*gap%) / 4
    // But since we use percentage, let's use a simpler approach:
    // Column centers at: 12.5%, 37.5%, 62.5%, 87.5% (for 4 equal cols no gap)
    // With gaps, the centers shift slightly. We'll approximate.
    
    const colCenters = [12.5, 37.5, 62.5, 87.5];
    const startCenter = colCenters[colStart];
    const endCenter = colCenters[colStart + colSpan - 1];
    const x = (startCenter + endCenter) / 2;
    
    // Row positions (percentage from top) - 3 rows
    // Row 0 (top): ~15%, Row 1 (middle): ~50%, Row 2 (bottom): ~85%
    const rowPositions = [15, 50, 85];
    const y = rowPositions[row] || 50;
    
    cellCenters[node.id] = { x, y };
  });

  const connections = [
    { from: "developer", to: "api" },
    { from: "api", to: "queue" },
    { from: "queue", to: "worker" },
    { from: "api", to: "build" },
    { from: "build", to: "runtime" },
    { from: "build", to: "network" },
    { from: "build", to: "observability" },
  ];

  return (
    <svg 
      className="absolute inset-0 pointer-events-none -z-10" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#2563FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="url(#flowGradient)" />
        </marker>
      </defs>
      
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: flowInView ? 1 : 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {connections.map((conn, index) => {
          const from = cellCenters[conn.from];
          const to = cellCenters[conn.to];
          
          if (!from || !to) return null;
          
          // Create curved path - adjust control point for vertical connections
          const isVertical = Math.abs(from.x - to.x) < 5;
          const ctrlX = isVertical ? from.x : (from.x + to.x) / 2;
          const ctrlY = Math.min(from.y, to.y) - (isVertical ? 5 : 8);
          
          return (
            <motion.path
              key={`${conn.from}-${conn.to}`}
              d={`M${from.x},${from.y} Q${ctrlX},${ctrlY} ${to.x},${to.y}`}
              stroke="url(#flowGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrowhead)"
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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}