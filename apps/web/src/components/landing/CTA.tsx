"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, GitBranch, CheckCircle2, Zap, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/design-system";
import { useMousePosition, useReducedMotion } from "@/hooks/useMousePosition";
import { useScrollReveal, scrollVariants } from "@/hooks/useScrollReveal";

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

export function CTA() {
  // Scroll reveals - all hooks at the top level
  const { ref: sectionRef, isInView: sectionInView } = useScrollReveal({ amount: 0.2 });
  const { ref: statsRef, isInView: statsInView } = useScrollReveal({ amount: 0.15, margin: "0px 0px -100px" });
  const { ref: ctaRef, isInView: ctaInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: trustRef, isInView: trustInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: finalRef, isInView: finalInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <MouseFollowGlow className="left-1/2 top-0 h-[320px] w-[540px] -translate-x-1/2" intensity={1.2} color="cyan" />
      <MouseFollowGlow className="right-0 bottom-0 h-[200px] w-[300px]" intensity={0.5} color="purple" />
      
      {/* Floating Particles */}
      <>
        <FloatingParticle delay={0} duration={15} x={10} y={20} size={3} color="#00E5FF" />
        <FloatingParticle delay={2} duration={18} x={85} y={15} size={2} color="#8B5CF6" />
        <FloatingParticle delay={4} duration={20} x={20} y={80} size={4} color="#00E5FF" />
        <FloatingParticle delay={6} duration={16} x={90} y={75} size={3} color="#8B5CF6" />
      </>

      <motion.div
        ref={sectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: sectionInView ? 1 : 0, y: sectionInView ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-16 text-center sm:px-12 lg:py-24"
      >
        <div
          aria-hidden
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00FF9C]/30 bg-[#00FF9C]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00FF9C]">
            <span className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow" />
            Ready to deploy?
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display relative mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Ship your next application{" "}
          <span className="bg-gradient-to-r from-[#00E5FF] via-[#2563FF] to-[#A78BFA] bg-clip-text text-transparent">
            in seconds
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg"
        >
          Connect a repository and see your first container running in production before your coffee gets cold.
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:max-w-none"
        >
          {[
            { icon: Zap, label: "60s", desc: "to production" },
            { icon: Globe, label: "12", desc: "global regions" },
            { icon: Shield, label: "99.9%", desc: "uptime SLA" },
            { icon: CheckCircle2, label: "Zero", desc: "config required" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              ref={statsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 20 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF]">
                <stat.icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-bold text-white">{stat.label}</p>
                <p className="text-xs text-zinc-500">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: ctaInView ? 1 : 0, y: ctaInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-12 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row"
        >
          <a
            href="/auth/signin"
            className={cn(
              "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl",
              "bg-gradient-to-b from-[#00E5FF] to-[#2563FF]",
              "hover:from-[#00B8D4] hover:to-[#1E40AF]",
              "px-6 py-3.5 text-sm font-semibold text-white",
              "shadow-[0_0_24px_-6px_rgba(0,229,255,0.4)]",
              "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            )}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center gap-2">
              Start Deploying Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </a>
          <a
            href="https://github.com/JainMehul05/CloudScale-project"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02]",
              "px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-sm",
              "transition-all duration-200 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] sm:w-auto"
            )}
          >
            <GitBranch className="h-4 w-4" />
            View on GitHub
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          ref={trustRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: trustInView ? 1 : 0, y: trustInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex flex-col items-center">
              <p className="font-display text-2xl font-bold text-white">10k+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Deployments</p>
            </div>
            <div className="hidden sm:flex h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <p className="font-display text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Uptime</p>
            </div>
            <div className="hidden sm:flex h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <p className="font-display text-2xl font-bold text-white">{"<50ms"}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Latency</p>
            </div>
            <div className="hidden sm:flex h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <p className="font-display text-2xl font-bold text-white">12</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Regions</p>
            </div>
          </div>
        </motion.div>

        {/* Final Message */}
        <motion.p
          ref={finalRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: finalInView ? 1 : 0, y: finalInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 text-sm text-zinc-500 text-center"
        >
          No credit card required. Free tier includes 100 deployments/month.
          <br />
          <a href="https://github.com/JainMehul05/CloudScale-project" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] hover:text-[#00B8D4] underline underline-offset-2">
            View source on GitHub
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}