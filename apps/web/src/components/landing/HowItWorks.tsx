"use client";

import { motion, useInView } from "framer-motion";
import {
  GitBranch,
  ArrowRight,
  Loader2,
  Container,
  Rocket,
  Terminal,
  Bot,
  Server,
  Database,
  Cpu,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useScrollReveal, scrollVariants } from "@/hooks/useScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Connect Repository",
    description: "Link your GitHub account and select the repository you want to deploy. CloudScale auto-detects your framework and configures everything.",
    icon: GitBranch,
    color: "violet",
    details: ["OAuth integration", "Auto framework detection", "Branch selection", "Webhook setup"],
  },
  {
    number: "02",
    title: "Push Code",
    description: "Push to your connected branch. CloudScale receives the webhook, enqueues the job in Redis, and assigns it to an available worker.",
    icon: ArrowRight,
    color: "blue",
    details: ["Git push triggers webhook", "Job enqueued in BullMQ", "Priority queue support", "Instant feedback"],
  },
  {
    number: "03",
    title: "Build Image",
    description: "Worker pulls the code and builds a production-optimized Docker image using BuildKit with multi-stage builds and layer caching.",
    icon: Loader2,
    color: "amber",
    details: ["BuildKit acceleration", "Multi-stage builds", "Layer caching", "Security scanning"],
  },
  {
    number: "04",
    title: "Deploy Container",
    description: "The built image is deployed as a hardened container with read-only rootfs, dropped capabilities, resource limits, and health checks.",
    icon: Container,
    color: "cyan",
    details: ["Security hardening", "Resource limits", "Health checks", "Blue-green deploy"],
  },
  {
    number: "05",
    title: "Go Live",
    description: "Container starts, health checks pass, traffic routes to the new version. Global load balancer, auto TLS, and custom domains configured.",
    icon: Rocket,
    color: "emerald",
    details: ["Global load balancing", "Auto TLS certificates", "Custom domains", "Edge caching"],
  },
  {
    number: "06",
    title: "Monitor & Debug",
    description: "Real-time log streaming via SSE, AI-powered error analysis, metrics, alerts, and instant rollback — all from your dashboard.",
    icon: Terminal,
    color: "violet",
    details: ["SSE live logs", "AI root cause analysis", "Metrics & alerts", "One-click rollback"],
  },
] as const;

const TECH_DETAILS = [
  { icon: GitBranch, label: "GitHub", desc: "OAuth + Webhooks" },
  { icon: Database, label: "Redis", desc: "BullMQ Queue" },
  { icon: Cpu, label: "Workers", desc: "Auto-scaling pools" },
  { icon: Container, label: "Docker", desc: "BuildKit + Hardened" },
  { icon: Server, label: "Runtime", desc: "Container orchestration" },
  { icon: Globe, label: "Network", desc: "Global LB + TLS" },
  { icon: Terminal, label: "Logs", desc: "SSE streaming" },
  { icon: Bot, label: "AI", desc: "Error diagnosis" },
] as const;

export function HowItWorks() {
  // Scroll reveals for different sections
  const { ref: bgRef, isInView: bgInView } = useScrollReveal({ amount: 0.1 });
  const { ref: headerRef, isInView: headerInView } = useScrollReveal({ amount: 0.15 });
  const { ref: stepsRef, isInView: stepsInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: techRef, isInView: techInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section id="workflow" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
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
          <SectionEyebrow>How It Works</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            From push to production in 60 seconds
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base leading-relaxed text-zinc-400"
          >
            Six automated steps. Zero configuration. Full control when you need it.
          </motion.p>
        </motion.div>

        {/* Steps Timeline */}
        <motion.div
          ref={stepsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: stepsInView ? 1 : 0, y: stepsInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 relative"
        >
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#00E5FF] via-[#2563FF] to-[#8B5CF6] opacity-50" />

          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                animate={{ opacity: stepsInView ? 1 : 0, x: stepsInView ? 0 : (index % 2 === 0 ? -40 : 40) }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className={cn(
                  "relative lg:w-1/2 lg:pr-12",
                  index % 2 === 1 && "lg:ml-auto lg:pl-12 lg:pr-0"
                )}>
                  <div className="relative group">
                    {/* Step Card */}
                    <div className={cn(
                      "relative p-6 rounded-2xl border bg-white/[0.02] transition-all duration-500",
                      "hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.15)] hover:-translate-y-1"
                    )}>
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex-shrink-0 h-14 w-14 items-center justify-center rounded-xl border",
                          "bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20",
                          `text-[#00E5FF] border-[#00E5FF]/20`
                        )}>
                          <step.icon className="h-7 w-7" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              "px-3 py-1 text-xs font-mono font-medium rounded-full border",
                              "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30"
                            )}>
                              Step {step.number}
                            </span>
                            <span className="font-display text-lg font-semibold text-white">{step.title}</span>
                          </div>
                          <p className="text-zinc-400">{step.description}</p>
                          
                          {/* Expandable details */}
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            whileHover={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2">
                              {step.details.map((detail, i) => (
                                <motion.span
                                  key={detail}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.05 + i * 0.05 }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-400 hover:border-[#00E5FF]/30 hover:bg-white/[0.04] hover:text-[#00E5FF] transition-all"
                                >
                                  {detail}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Connecting Dot on Timeline */}
                    <div className="hidden lg:block absolute right-[-38px] top-[38px] z-10" style={{ ...(index % 2 === 0 ? { right: '-38px' } : { left: '-38px' }) }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: stepsInView ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 + index * 0.1 }}
                        className="w-4 h-4 rounded-full border-4 border-[#050505] bg-gradient-to-br from-[#00E5FF] to-[#8B5CF6] shadow-[0_0_0_2px_rgba(0,229,255,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Details */}
        <motion.div
          ref={techRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: techInView ? 1 : 0, y: techInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24"
        >
          <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-8 text-center">Powered by Modern Infrastructure</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {TECH_DETAILS.map((tech, index) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: techInView ? 1 : 0, y: techInView ? 0 : 20 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-4 rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_12px_24px_-8px_rgba(0,229,255,0.1)]"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF] mb-3 group-hover:scale-110 transition-transform">
                  <tech.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h4 className="font-medium text-white mb-1">{tech.label}</h4>
                <p className="text-xs text-zinc-500">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}