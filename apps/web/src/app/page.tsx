"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Container,
  Bot,
  Activity,
  Terminal,
  ArrowRight,
  Code2,
  FileCode,
  Layers,
  Database,
  GitBranch,
  Zap,
  Shield,
  Globe,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductPreview from "@/components/ProductPreview";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { useMousePosition, useReducedMotion } from "@/hooks/useMousePosition";

const GITHUB_URL = "https://github.com/JainMehul05/cloudscale-test-app";

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

function MouseFollowGlow({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const { normalizedX, normalizedY } = useMousePosition();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  const x = `${50 + normalizedX * 15 * intensity}%`;
  const y = `${50 + normalizedY * 15 * intensity}%`;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[110px] transition-all duration-300 ease-out ${className ?? ""}`}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        willChange: "transform",
      }}
    />
  );
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className ?? ""}`}
    />
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
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
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`
        group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg
        bg-gradient-to-b from-blue-500 to-cyan-600
        px-6 py-3.5 text-sm font-semibold text-white
        shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_8px_28px_-6px_rgba(59,130,246,0.65)]
        transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto
        ${className}
      `}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">
        {children}
        {icon && (
          <span className="relative transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
    </a>
  );
}

function SecondaryButton({
  children,
  href = "#",
  icon,
  external = false,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`
        inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02]
        px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-sm
        transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.06] sm:w-auto
        ${className}
      `}
    >
      {icon}
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 lg:px-8">
      <MouseFollowGlow className="h-[520px] w-[760px] bg-blue-600/15" intensity={1.2} />
      <MouseFollowGlow className="h-[300px] w-[300px] bg-violet-600/10 left-1/4 top-40" intensity={0.8} />
      <MouseFollowGlow className="h-[260px] w-[260px] bg-cyan-500/08 right-1/4 top-64" intensity={0.6} />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionEyebrow>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="h-2 w-2 rounded-full bg-emerald-400"
            />
            Now with AI-powered debugging
          </SectionEyebrow>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Deploy, monitor, and{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            debug
          </span>{" "}
          applications on the cloud automatically
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          CloudScale turns your GitHub repository into production-ready cloud
          deployments using Docker, hardened containers, worker queues, and AI-powered troubleshooting.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row"
        >
          <MagneticButton href="/auth/signin" icon={<ArrowRight className="h-4 w-4" />} strength={0.4}>
            Start Deploying
          </MagneticButton>
          <SecondaryButton
            href={GITHUB_URL}
            external
            icon={<GitBranch className="h-4 w-4" />}
          >
            View on GitHub
          </SecondaryButton>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 relative mx-auto max-w-5xl"
      >
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-1">
          <div className="rounded-xl bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center text-xs text-zinc-500 font-mono">cloudscale.config.ts</div>
            </div>
            <pre className="text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto">
{`const config = {
  provider: "docker",
  registry: "cloudscale.io",
  security: {
    readonlyRootfs: true,
    capabilities: ["CHOWN", "DAC_OVERRIDE"],
    resources: { memory: "512Mi", cpu: "500m" }
  },
  networking: { port: 3000, tls: true }
}`}</pre>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function MagneticButton({
  children,
  href = "#",
  icon,
  external = false,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  external?: boolean;
  className?: string;
  strength?: number;
}) {
  const { x, y } = useMousePosition();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    const raf = requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (x - centerX) * strength;
      const deltaY = (y - centerY) * strength;

      setOffset({ x: deltaX, y: deltaY });
    });

    return () => cancelAnimationFrame(raf);
  }, [x, y, strength, reducedMotion]);

  return (
    <a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`
        group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg
        bg-gradient-to-b from-blue-500 to-cyan-600
        px-6 py-3.5 text-sm font-semibold text-white
        shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_8px_28px_-6px_rgba(59,130,246,0.65)]
        transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto
        ${className}
      `}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) ${offset.x || offset.y ? "scale(1.02)" : ""}`,
      }}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">
        {children}
        {icon && (
          <span className="relative transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
    </a>
  );
}

function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}) {
  const { x, y } = useMousePosition();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    const raf = requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect || !isHovered) {
        setRotation({ x: 0, y: 0 });
        return;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (x - centerX) / (rect.width / 2);
      const deltaY = (y - centerY) / (rect.height / 2);

      setRotation({
        x: Math.max(-maxTilt, Math.min(maxTilt, -deltaY * maxTilt)),
        y: Math.max(-maxTilt, Math.min(maxTilt, deltaX * maxTilt)),
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [x, y, maxTilt, isHovered, reducedMotion]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`
          : "none",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {METRICS.map((metric) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300">
                <metric.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <span className="font-display text-2xl font-semibold text-white">
                {metric.value}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                {metric.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Container,
    title: "Docker Deployments",
    description:
      "Push to GitHub and CloudScale builds, containers, and ships your app automatically  no complex configurations required.",
    highlight: "Zero-config Docker builds",
  },
  {
    icon: Bot,
    title: "AI Debugging",
    description:
      "When a build or runtime error hits, CloudScale's AI reads the logs and tells you exactly what broke and how to fix it.",
    highlight: "Instant root cause analysis",
  },
  {
    icon: Activity,
    title: "Redis Queue Workers",
    description:
      "A robust worker engine manages deployment queues behind the scenes, ensuring reliable, uninterrupted rollouts.",
    highlight: "BullMQ-powered reliability",
  },
  {
    icon: Terminal,
    title: "Streaming Logs",
    description:
      "Live request monitoring and build logs attached directly to every deployment, so you always know what's happening.",
    highlight: "SSE-powered live tail",
  },
  {
    icon: Shield,
    title: "Hardened Security",
    description:
      "Containers run with read-only rootfs, dropped capabilities, non-root users, and resource limits by default.",
    highlight: "Production-grade isolation",
  },
  {
    icon: Globe,
    title: "Global Edge Ready",
    description:
      "Deploy to multiple regions with automatic TLS, custom domains, and edge caching built into the platform.",
    highlight: "Multi-region by default",
  },
] as const;

function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <GlowOrb className="left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-violet-600/10" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Features</SectionEyebrow>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything your deployment pipeline needs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            From first push to production traffic, CloudScale handles the
            infrastructure, queueing, building, and monitoring.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <TiltCard maxTilt={6} scale={1.015} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/0 blur-2xl transition-all duration-500 group-hover:bg-blue-500/15"
                />
                <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300 group-hover:bg-gradient-to-br group-hover:from-blue-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                  <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display relative mt-4 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
                <span className="absolute bottom-6 right-6 text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {feature.highlight}
                </span>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: GitBranch,
    title: "Connect GitHub",
    description:
      "Authorize your repository and CloudScale listens for new commits and pull requests.",
    detail: "OAuth + Webhooks",
  },
  {
    icon: Layers,
    title: "Queue & Process",
    description:
      "The Redis-backed worker engine safely queues builds and provisions deployment jobs in isolation.",
    detail: "BullMQ + Redis",
  },
  {
    icon: Container,
    title: "Build & Ship",
    description:
      "Your app is automatically containerized via Docker and shipped directly to scalable cloud infrastructure.",
    detail: "Docker + BuildKit",
  },
  {
    icon: Bot,
    title: "Monitor & Debug",
    description:
      "Access real-time streaming logs. If an error occurs, the AI engine pinpoints exactly how to fix it.",
    detail: "SSE + AI Analysis",
  },
] as const;

function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <GlowOrb className="left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-violet-600/10" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From commit to production in four steps
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6"
        >
          <div
            aria-hidden
            className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-blue-500/40 via-white/15 to-violet-500/40 md:block"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex flex-col items-start"
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-blue-300 shadow-[0_0_0_4px_rgba(0,0,0,1)] group-hover:border-blue-500/50 transition-colors">
                <step.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <span className="mt-4 font-mono text-xs text-zinc-600">
                Step {i + 1}
              </span>
              <h3 className="font-display mt-1 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {step.description}
              </p>
              <span className="mt-3 text-xs font-medium text-blue-400">{step.detail}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const TECH_STACK = [
  { icon: Code2, label: "Next.js 16" },
  { icon: FileCode, label: "TypeScript" },
  { icon: Container, label: "Docker" },
  { icon: Layers, label: "Redis" },
  { icon: Database, label: "PostgreSQL" },
  { icon: Cpu, label: "BullMQ" },
  { icon: Zap, label: "Turbopack" },
  { icon: Shield, label: "NextAuth v5" },
] as const;

function BuiltWith() {
  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-medium uppercase tracking-widest text-zinc-500"
        >
          Built with
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          {TECH_STACK.map((tech) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.05]"
            >
              <tech.icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
              {tech.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <MouseFollowGlow className="left-1/2 top-0 h-[320px] w-[540px] -translate-x-1/2 bg-blue-600/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-16 text-center sm:px-12"
      >
        <h2 className="font-display relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ship your next deploy in seconds
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base text-zinc-400">
          Connect a repository and see your first container running in
          production before your coffee gets cold.
        </p>
        <div className="relative mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
          <MagneticButton href="/auth/signin" icon={<ArrowRight className="h-4 w-4" />} strength={0.4}>
            Start Deploying
          </MagneticButton>
          <SecondaryButton
            href={GITHUB_URL}
            external
            icon={<GitBranch className="h-4 w-4" />}
          >
            View on GitHub
          </SecondaryButton>
        </div>
      </motion.div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Documentation", "Roadmap", "Changelog"],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Discord", href: "#", external: true },
      { label: "Status", href: "#", external: true },
    ],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6"
        >
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2" aria-label="CloudScale Home">
              <CloudScaleLogo size="md" showText textSize="lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Deploy applications from GitHub to the cloud automatically, with Docker,
              hardened containers, monitoring, and AI-powered debugging built in.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => {
                  const isObj = typeof link !== "string";
                  const label = isObj ? link.label : link;
                  const href = isObj ? link.href : "#";
                  const external = isObj ? Boolean(link.external) : false;
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row"
        >
          <p className="text-xs text-zinc-600">
             {new Date().getFullYear()} CloudScale. All rights reserved.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <GitBranch className="h-4 w-4" />
            View source on GitHub
          </a>
        </motion.div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <GrainOverlay />
      <Navbar />
      <Hero />
      <TrustedBy />
      <ProductPreview />
      <Features />
      <HowItWorks />
      <BuiltWith />
      <CallToAction />
      <Footer />
    </main>
  );
}








