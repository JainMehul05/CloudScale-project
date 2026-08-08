"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
    Layers,
    Container,
    Rocket,
    Terminal,
    CheckCircle2,
    Bot,
    Activity,
    GitBranch,
  } from "lucide-react";
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
    { icon: GitBranch, label: "GitHub" },
  { icon: Layers, label: "Redis Queue" },
  { icon: Activity, label: "Worker" },
  { icon: Container, label: "Docker" },
  { icon: Rocket, label: "Deploy" },
  { icon: Terminal, label: "Logs" },
  { icon: Bot, label: "AI Debug" },
] as const;

const PIPELINE_CHECKLIST = [
  "Repository cloned",
  "Job queued in Redis",
  "Worker engine started",
  "Docker image built",
  "Container deployed",
  "Streaming logs attached",
  "AI debugging active",
];

const PREVIEW_TABS = ["Overview", "Pipeline"] as const;

export default function ProductPreview() {
  const [tab, setTab] = useState<(typeof PREVIEW_TABS)[number]>("Overview");

  return (
    <section id="product" className="relative scroll-mt-24 px-4 pb-32 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="relative mx-auto max-w-5xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[110px]"
        />

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_50px_100px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          {/* window chrome */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
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
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    tab === t
                      ? "bg-white/10 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline strip */}
          <div className="border-b border-white/10 bg-black/20 px-4 py-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-blue-300">
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

          <div className="grid gap-0 md:grid-cols-5">
            {/* Status panel */}
            <div className="border-b border-white/10 p-6 md:col-span-2 md:border-b-0 md:border-r">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Deployment
              </p>
              <p className="font-display mt-1 text-lg font-semibold text-white">
                portfolio-app
              </p>

              <div className="mt-5 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-emerald-400">Running</span>
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
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
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

            {/* Pipeline checklist panel */}
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
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
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
        </div>
      </motion.div>
    </section>
  );
}