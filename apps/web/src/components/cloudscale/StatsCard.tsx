"use client";

import { motion } from "framer-motion";
import { cn, componentStyles } from "@/lib/design-system";
import { TrendingUp, TrendingDown, Minus, GitBranch, Box, Server, Clock, AlertCircle, CheckCircle } from "lucide-react";

export type StatVariant = "projects" | "deployments" | "running" | "failed" | "stopped" | "total" | "success-rate" | "avg-duration";

export interface StatData {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
    period?: string;
  };
  variant?: StatVariant;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export interface StatsCardProps {
  stats: StatData[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
}

const variantIcons: Record<StatVariant, React.ReactNode> = {
  projects: <GitBranch className="w-5 h-5" />,
  deployments: <Box className="w-5 h-5" />,
  running: <Server className="w-5 h-5" />,
  failed: <AlertCircle className="w-5 h-5" />,
  stopped: <Clock className="w-5 h-5" />,
  total: <Box className="w-5 h-5" />,
  "success-rate": <CheckCircle className="w-5 h-5" />,
  "avg-duration": <Clock className="w-5 h-5" />,
};

const variantColors: Record<StatVariant, { bg: string; text: string; border: string; icon: string }> = {
  projects: { bg: "rgba(139,92,246,0.12)", text: "#A78BFA", border: "rgba(139,92,246,0.25)", icon: "text-[#A78BFA]" },
  deployments: { bg: "rgba(0,229,255,0.12)", text: "#00E5FF", border: "rgba(0,229,255,0.25)", icon: "text-[#00E5FF]" },
  running: { bg: "rgba(0,255,156,0.12)", text: "#00FF9C", border: "rgba(0,255,156,0.25)", icon: "text-[#00FF9C]" },
  failed: { bg: "rgba(255,51,102,0.12)", text: "#FF3366", border: "rgba(255,51,102,0.25)", icon: "text-[#FF3366]" },
  stopped: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.25)", icon: "text-zinc-400" },
  total: { bg: "rgba(139,92,246,0.12)", text: "#A78BFA", border: "rgba(139,92,246,0.25)", icon: "text-[#A78BFA]" },
  "success-rate": { bg: "rgba(0,255,156,0.12)", text: "#00FF9C", border: "rgba(0,255,156,0.25)", icon: "text-[#00FF9C]" },
  "avg-duration": { bg: "rgba(255,207,50,0.12)", text: "#FFCF32", border: "rgba(255,207,50,0.25)", icon: "text-[#FFCF32]" },
};

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function StatsCard({
  stats,
  className,
  columns = 3,
  gap = "md",
  variant = "default",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.08 }}
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      role="list"
      aria-label="Statistics"
    >
      {stats.map((stat, index) => (
        <motion.div key={`${stat.label}-${index}`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard stat={stat} variant={variant} />
        </motion.div>
      ))}
    </motion.div>
  );
}

interface StatCardProps {
  stat: StatData;
  variant?: "default" | "compact" | "detailed";
}

function StatCard({ stat, variant: cardVariant = "default" }: StatCardProps) {
  const { label, value, change, variant: statVariant = "total", icon, trend = "neutral" } = stat;
  const colorConfig = variantColors[statVariant];
  const defaultIcon = variantIcons[statVariant];

  const trendIcon = trend === "up" ? (
    <TrendingUp className="w-3.5 h-3.5 text-[#00FF9C]" />
  ) : trend === "down" ? (
    <TrendingDown className="w-3.5 h-3.5 text-[#FF3366]" />
  ) : (
    <Minus className="w-3.5 h-3.5 text-zinc-500" />
  );

  const trendColor = trend === "up" ? "text-[#00FF9C]" : trend === "down" ? "text-[#FF3366]" : "text-zinc-500";

  if (cardVariant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          componentStyles.card.base,
          componentStyles.card.hover,
          "p-3 flex items-center gap-3 transition-all duration-200"
        )}
        role="listitem"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{ backgroundColor: colorConfig.bg, borderColor: colorConfig.border }}
        >
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className={cn("w-4 h-4", colorConfig.icon)}
          >
            {icon || defaultIcon}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500 truncate">{label}</p>
          <p className="font-semibold text-white truncate">{value}</p>
        </div>
        {change && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}
          >
            {trendIcon}
            <span>{change.value >= 0 ? "+" : ""}{change.value}%</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (cardVariant === "detailed") {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}
        transition={{ duration: 0.3 }}
        className={cn(
          componentStyles.card.base,
          componentStyles.card.hover,
          componentStyles.card.elevated,
          "p-6 overflow-hidden transition-all duration-300 relative"
        )}
        role="listitem"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        <div className="relative flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ backgroundColor: colorConfig.bg, borderColor: colorConfig.border }}
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
                className={cn("w-5 h-5", colorConfig.icon)}
              >
                {icon || defaultIcon}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
              {change && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex items-center gap-1 mt-0.5 text-xs font-medium", trendColor)}
                >
                  {trendIcon}
                  <span>{change.value >= 0 ? "+" : ""}{change.value}%</span>
                  {change.period && <span className="text-zinc-500">vs {change.period}</span>}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-white tabular-nums relative z-10"
        >
          {value}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)" }}
      transition={{ duration: 0.3 }}
      className={cn(
        componentStyles.card.base,
        componentStyles.card.hover,
        componentStyles.card.elevated,
        "p-5 overflow-hidden transition-all duration-300 relative"
      )}
      role="listitem"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ backgroundColor: colorConfig.bg, borderColor: colorConfig.border }}
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
                className={cn("w-4 h-4", colorConfig.icon)}
              >
                {icon || defaultIcon}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
              {change && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex items-center gap-1 mt-0.5 text-xs font-medium", trendColor)}
                >
                  {trendIcon}
                  <span>{change.value >= 0 ? "+" : ""}{change.value}%</span>
                  {change.period && <span className="text-zinc-500">vs {change.period}</span>}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-2xl font-bold text-white tabular-nums"
        >
          {value}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function createStatData(
  label: string,
  value: string | number,
  options?: {
    change?: number;
    changeLabel?: string;
    changePeriod?: string;
    variant?: StatVariant;
    trend?: "up" | "down" | "neutral";
  }
): StatData {
  return {
    label,
    value,
    variant: options?.variant || "total",
    trend: options?.trend || "neutral",
    change: options?.change !== undefined ? {
      value: options.change,
      label: options.changeLabel,
      period: options.changePeriod,
    } : undefined,
  };
}