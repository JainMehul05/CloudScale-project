import type { ReactNode } from "react";
import {
  Rocket,
  Container,
  Bot,
  Activity,
  Cloud,
  Terminal,
  ArrowRight,
  Circle,
  Code2,
  FileCode,
  Boxes,
  Layers,
  Database,
  GitBranch,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductPreview from "@/components/ProductPreview";

const GITHUB_URL = "https://github.com/cloudscale/cloudscale";

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
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
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_8px_28px_-6px_rgba(59,130,246,0.65)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
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
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.06] sm:w-auto"
    >
      {icon}
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 lg:px-8">
      <GlowOrb className="left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 bg-blue-600/25" />
      <GlowOrb className="left-1/4 top-40 h-[300px] w-[300px] bg-violet-600/20" />
      <GlowOrb className="right-1/4 top-64 h-[260px] w-[260px] bg-cyan-500/10" />

      {/* subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div>
          <SectionEyebrow>
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            Now with AI-powered debugging
          </SectionEyebrow>
        </div>

        <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Deploy, monitor, and{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            debug
          </span>{" "}
          applications on the cloud automatically
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
          CloudScale turns your GitHub repository into production-ready cloud
          deployments using Docker, worker queues, and AI-powered troubleshooting.
        </p>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
          <PrimaryButton href="#product" icon={<ArrowRight className="h-4 w-4" />}>
            Deploy Now
          </PrimaryButton>
          <SecondaryButton
            href={GITHUB_URL}
            external
            icon={<GitBranch className="h-4 w-4" />}
          >
            View GitHub
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

const METRICS = [
  { icon: Container, value: "Docker", label: "Powered" },
  { icon: Bot, value: "AI", label: "Debugging" },
  { icon: Terminal, value: "Real-time", label: "Logs" },
  { icon: Cloud, value: "Native", label: "Cloud" },
] as const;

function TrustedBy() {
  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Built for modern engineering teams
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6"
            >
              <metric.icon className="h-4 w-4 text-blue-400" strokeWidth={1.75} />
              <span className="font-display text-2xl font-semibold text-white">
                {metric.value}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Container,
    title: "Docker Deployments",
    description:
      "Push to GitHub and CloudScale builds, containers, and ships your app automatically — no complex configurations required.",
  },
  {
    icon: Bot,
    title: "AI Debugging",
    description:
      "When a build or runtime error hits, CloudScale's AI reads the logs and tells you exactly what broke and how to fix it.",
  },
  {
    icon: Activity,
    title: "Redis Queue Workers",
    description:
      "A robust worker engine manages deployment queues behind the scenes, ensuring reliable, uninterrupted rollouts.",
  },
  {
    icon: Terminal,
    title: "Streaming Logs",
    description:
      "Live request monitoring and build logs attached directly to every deployment, so you always know what's happening.",
  },
] as const;

function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>Features</SectionEyebrow>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything your deployment pipeline needs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            From first push to production traffic, CloudScale handles the
            infrastructure queueing, building, and monitoring.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/0 blur-2xl transition-colors duration-500 group-hover:bg-blue-500/20"
              />
              <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-display relative mt-4 text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
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
  },
  {
    icon: Layers,
    title: "Queue & Process",
    description:
      "The Redis-backed worker engine safely queues builds and provisions deployment jobs in isolation.",
  },
  {
    icon: Container,
    title: "Build & Ship",
    description:
      "Your app is automatically containerized via Docker and shipped directly to scalable cloud infrastructure.",
  },
  {
    icon: Bot,
    title: "Monitor & Debug",
    description:
      "Access real-time streaming logs. If an error occurs, the AI engine pinpoints exactly how to fix it.",
  },
] as const;

function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <GlowOrb className="left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-violet-600/10" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From commit to production
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-blue-500/40 via-white/15 to-violet-500/40 md:block"
          />

          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-start">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-blue-300 shadow-[0_0_0_4px_rgba(0,0,0,1)]">
                <step.icon className="h-5 w-5" strokeWidth={1.75} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECH_STACK = [
  { icon: Code2, label: "Next.js" },
  { icon: FileCode, label: "TypeScript" },
  { icon: Container, label: "Docker" },
  { icon: Layers, label: "Redis" },
  { icon: Database, label: "PostgreSQL" },
  { icon: Cloud, label: "AWS" },
  { icon: Boxes, label: "Terraform" },
] as const;

function BuiltWith() {
  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Built with
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <tech.icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
              {tech.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-16 text-center sm:px-12">
        <GlowOrb className="left-1/2 top-0 h-[320px] w-[540px] -translate-x-1/2 bg-blue-600/25" />
        <h2 className="font-display relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ship your next deploy in seconds
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base text-zinc-400">
          Connect a repository and see your first container running in
          production before your coffee gets cold.
        </p>
        <div className="relative mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
          <PrimaryButton href="#product" icon={<ArrowRight className="h-4 w-4" />}>
            Deploy Now
          </PrimaryButton>
          <SecondaryButton
            href={GITHUB_URL}
            external
            icon={<GitBranch className="h-4 w-4" />}
          >
            View GitHub
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Documentation", "Roadmap"],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
];

function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                <Rocket className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base font-semibold text-white">
                CloudScale
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Deploy applications from GitHub to the cloud automatically, with Docker,
              monitoring, and AI-powered debugging built in.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
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
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} CloudScale. All rights reserved.
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
        </div>
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