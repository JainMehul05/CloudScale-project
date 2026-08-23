"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn } from "@/lib/design-system";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  color?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutDashboard className="h-5 w-5" />,
    color: "#00E5FF",
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: <FolderGit2 className="h-5 w-5" />,
    color: "#8B5CF6",
  },
  {
    href: "/dashboard/deployments",
    label: "Deployments",
    icon: <GitBranch className="h-5 w-5" />,
    color: "#00FF9C",
  },
  {
    href: "/dashboard/logs",
    label: "Logs",
    icon: <Terminal className="h-5 w-5" />,
    color: "#FFCF32",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    color: "#2563FF",
  },
];

export interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleItemClick = () => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setCollapsed(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl",
          "bg-[#0D0D12] border border-white/[0.08] text-zinc-400",
          "hover:bg-white/[0.05] hover:text-white transition-colors",
          "shadow-[0_12px_16px_-4px_rgba(0,0,0,0.5)]"
        )}
        aria-label="Open sidebar"
        aria-expanded={!collapsed}
      >
        <ChevronRight className="h-5 w-5" />
      </motion.button>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => setCollapsed(true)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 flex flex-col",
          "w-[240px] bg-[#080808] border-r border-white/[0.08]",
          "transition-all duration-300 ease-in-out",
          "lg:transition-none lg:w-[240px]",
          collapsed && "lg:w-20",
          className
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.08]">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              aria-label="CloudScale Dashboard"
              onClick={handleItemClick}
            >
              <CloudScaleLogo size="md" variant="default" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-300 to-[#00E5FF] bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              >
                CloudScale
              </motion.span>
            </Link>

            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors",
                "lg:hidden",
                collapsed && "rotate-180"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Dashboard navigation">
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleItemClick}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "text-sm font-medium transition-all duration-200",
                      "relative overflow-hidden group",
                      isActive
                        ? "bg-gradient-to-r from-[#00E5FF]/10 to-[#8B5CF6]/10 text-white border border-white/[0.08]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]",
                      collapsed && "justify-center px-2"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive && "text-[#00E5FF]"
                      )}
                      aria-hidden="true"
                      style={{ color: isActive ? item.color : undefined }}
                    >
                      {item.icon}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate transition-opacity duration-200 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                    {item.badge && !collapsed && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto px-2 py-0.5 text-[10px] font-medium text-[#00E5FF] bg-[#00E5FF]/10 rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                    {isActive && !collapsed && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 3 }}
                        exit={{ width: 0 }}
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-b from-[#00E5FF] to-[#8B5CF6] rounded-l-xl"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/[0.08]">
            <Link
              href="https://github.com/JainMehul05/CloudScale-project"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.03]",
                "transition-all duration-200 group",
                collapsed && "justify-center px-2"
              )}
              onClick={handleItemClick}
              title={collapsed ? "GitHub" : undefined}
            >
              <motion.svg
                whileHover={{ rotate: 6, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-5 w-5 flex-shrink-0 group-hover:text-[#8B5CF6] transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </motion.svg>
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                GitHub
              </motion.span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export interface DashboardSidebarProps {
  className?: string;
}