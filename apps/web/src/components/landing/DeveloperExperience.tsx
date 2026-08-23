"use client";

import { motion, useInView } from "framer-motion";
import {
  Terminal,
  Zap,
  Shield,
  Globe,
  Code2,
  Settings,
  Link2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useScrollReveal, scrollVariants } from "@/hooks/useScrollReveal";

const DEV_FEATURES = [
  {
    icon: Code2,
    title: "Zero-Config Deployments",
    description: "Push to GitHub and CloudScale handles the rest. No Dockerfiles, no YAML, no infrastructure code required.",
    code: `git push origin main
# CloudScale auto-detects framework
# Builds optimized Docker image
# Deploys to global infrastructure`,
  },
  {
    icon: Terminal,
    title: "Real-Time Log Streaming",
    description: "Watch builds and runtime logs live via SSE. Filter, search, and download — all without leaving your browser.",
    code: `$ cloudscale logs --follow
[BUILD] Cloning repository...
[BUILD] Installing dependencies...
[BUILD] ✓ Build complete (45s)
[DEPLOY] Starting container...
[DEPLOY] ✓ Health check passed
[APP] Server running on :3000`,
  },
  {
    icon: Zap,
    title: "Instant Rollbacks",
    description: "One-click rollback to any previous deployment. Zero-downtime blue-green deployments built-in.",
    code: `$ cloudscale rollback v42
✓ Rolling back to v42
✓ Traffic switched
✓ Old containers drained
✓ Rollback complete (3s)`,
  },
  {
    icon: Settings,
    title: "Environment Management",
    description: "Secure, encrypted environment variables with team-scoped access. Rotate secrets without redeploying.",
    code: `# Set secret (encrypted at rest)
$ cloudscale env:set DATABASE_URL=...
✓ Secret stored with AES-256-GCM

# Rotate without redeploy
$ cloudscale env:rotate API_KEY
✓ New key generated
✓ Injected into running containers`,
  },
  {
    icon: Globe,
    title: "Global Edge Network",
    description: "Deploy to 12 regions worldwide. Automatic TLS, custom domains, edge caching, and geo-routing included.",
    code: `# Deploy to multiple regions
$ cloudscale deploy --regions=us-east,eu-west,ap-south
✓ Containers started in 3 regions
✓ Global load balancer configured
✓ Auto TLS certificates issued`,
  },
  {
    icon: Shield,
    title: "Security by Default",
    description: "Hardened containers with read-only rootfs, dropped capabilities, seccomp profiles, and non-root users.",
    code: `# Security profile applied automatically
docker run --security-opt=no-new-privileges \
  --cap-drop=ALL \
  --read-only \
  --user=1000:1000 \
  --pids-limit=100 \
  your-app:latest`,
  },
] as const;

const CLI_COMMANDS = [
  { command: "cloudscale init", description: "Initialize project in current directory" },
  { command: "cloudscale deploy", description: "Deploy current branch to production" },
  { command: "cloudscale logs -f", description: "Stream real-time logs" },
  { command: "cloudscale env:set KEY=val", description: "Set encrypted environment variable" },
  { command: "cloudscale rollback v42", description: "Instant rollback to version 42" },
  { command: "cloudscale status", description: "Show deployment status and health" },
  { command: "cloudscale domains add", description: "Add custom domain with auto TLS" },
  { command: "cloudscale scale --replicas=5", description: "Scale container replicas" },
] as const;

export function DeveloperExperience() {
  // Scroll reveals for different sections
  const { ref: bgRef, isInView: bgInView } = useScrollReveal({ amount: 0.1 });
  const { ref: headerRef, isInView: headerInView } = useScrollReveal({ amount: 0.15 });
  const { ref: devFeaturesRef, isInView: devFeaturesInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: cliRef, isInView: cliInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });
  const { ref: apiRef, isInView: apiInView } = useScrollReveal({ amount: 0.1, margin: "0px 0px -100px" });

  return (
    <section id="developer-experience" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
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
          <SectionEyebrow>Developer Experience</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Built for developers, by developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base leading-relaxed text-zinc-400"
          >
            Every feature designed to keep you in flow. From first push to production debugging,
            CloudScale gets out of your way so you can focus on writing code.
          </motion.p>
        </motion.div>

        {/* Dev Features */}
        <motion.div
          ref={devFeaturesRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: devFeaturesInView ? 1 : 0, y: devFeaturesInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 space-y-6"
        >
          {DEV_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: devFeaturesInView ? 1 : 0, y: devFeaturesInView ? 0 : 20 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:border-[#00E5FF]/30 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(0,229,255,0.1)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Visual Side */}
                <div className="relative p-8 lg:p-12 bg-gradient-to-br from-[#00E5FF]/5 to-transparent">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#00E5FF]/0 blur-3xl transition-all duration-500 group-hover:bg-[#00E5FF]/10"
                  />
                  <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF] mb-6">
                    <feature.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 max-w-md">{feature.description}</p>
                </div>

                {/* Code Side */}
                <div className="relative bg-[#050508] border-l border-white/10 p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFCF32]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9C]/70" />
                    <span className="ml-auto text-xs text-zinc-500 font-mono">terminal</span>
                  </div>
                  <pre className="text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto">
                    <code>{feature.code}</code>
                  </pre>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors rounded bg-white/[0.03] hover:bg-white/[0.05] flex items-center gap-1.5">
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                    <span className="text-xs text-zinc-600">Click to copy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CLI Section */}
        <motion.div
          ref={cliRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: cliInView ? 1 : 0, y: cliInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl font-bold text-white">CloudScale CLI</h3>
            <p className="mt-2 text-zinc-400">Full control from your terminal</p>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-zinc-950/80 p-8 backdrop-blur-xl overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid-cyan opacity-30"
              style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)" }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLI_COMMANDS.map((cmd, index) => (
                <motion.div
                  key={cmd.command}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: cliInView ? 1 : 0, y: cliInView ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow" />
                    <code className="font-mono text-sm text-[#00E5FF]">{cmd.command}</code>
                  </div>
                  <span className="ml-auto text-sm text-zinc-500">{cmd.description}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* API/SDK Section */}
        <motion.div
          ref={apiRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: apiInView ? 1 : 0, y: apiInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Programmatic Access</h3>
              <p className="mt-2 text-zinc-400">
                REST API and TypeScript SDK for building custom integrations, CI/CD pipelines, and internal tools.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF]">
                    <Code2 className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-white">TypeScript SDK</p>
                    <p className="text-sm text-zinc-400">Type-safe client with full IntelliSense</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF]">
                    <Link2 className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-white">REST API</p>
                    <p className="text-sm text-zinc-400">OpenAPI spec with auto-generated clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/30 hover:bg-white/[0.03] transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF]">
                    <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Webhooks</p>
                    <p className="text-sm text-zinc-400">Real-time events for deployments, logs, alerts</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFCF32]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9C]/70" />
              </div>
              <pre className="text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto">
                <code>{`import { CloudScale } from '@cloudscale/sdk';

const client = new CloudScale({
  apiKey: process.env.CLOUDSCALE_KEY
});

// Deploy a new version
const deployment = await client.deployments.create({
  projectId: 'my-app',
  branch: 'main'
});

// Stream logs in real-time
for await (const log of client.logs.stream(deployment.id)) {
  console.log(log.message);
}

// Rollback on failure
if (deployment.status === 'failed') {
  await client.deployments.rollback(deployment.id);
}`}</code>
              </pre>
            </div>
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