"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
} from "lucide-react";
import { cn, componentStyles } from "@/lib/design-system";

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  className?: string;
  onSearch?: () => void;
  onNotifications?: () => void;
  onMenuClick?: () => void;
}

export function DashboardHeader({
  description,
  className,
  onSearch,
  onNotifications,
  onMenuClick,
}: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setUserMenuOpen(false);
      setSearchOpen(false);
      setNotificationsOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.08]",
        "px-4 md:px-6 lg:px-8",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto max-w-full h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1 lg:max-w-[50%]">
          <div className="hidden sm:block w-px h-5 bg-white/[0.08]" />
          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg font-bold tracking-tight text-white sm:text-xl bg-gradient-to-r from-white via-zinc-300 to-[#00E5FF] bg-clip-text text-transparent"
            >
              Cloud Control Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-0.5 text-xs text-zinc-500 truncate"
            >
              {description || "Monitor deployments, infrastructure and application health"}
            </motion.p>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/10">
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#00FF9C]"
            />
            <span className="text-xs font-medium text-zinc-300">All systems operational</span>
          </motion.span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setUserMenuOpen(false);
                setNotificationsOpen(false);
                onSearch?.();
              }}
              className={cn(
                "p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors",
                searchOpen && "text-[#00E5FF] bg-[#00E5FF]/10"
              )}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72"
                >
                  <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-2")}>
                    <form className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-zinc-500 ml-3" aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Search projects, deployments..."
                        className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none w-full py-2 pr-3"
                        aria-label="Search"
                        autoFocus
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-zinc-500 bg-white/[0.05] rounded">
                        <span>⌘</span>K
                      </kbd>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
                setSearchOpen(false);
                onNotifications?.();
              }}
              className={cn(
                "p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors relative",
                notificationsOpen && "text-[#00E5FF] bg-[#00E5FF]/10"
              )}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3366] rounded-full" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80"
                >
                  <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}>
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Notifications</h3>
                      <button className="text-xs text-zinc-400 hover:text-white">Mark all read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                        No notifications yet
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setSearchOpen(false);
                setNotificationsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-xl",
                "text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors",
                userMenuOpen && "text-white bg-white/[0.05]"
              )}
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center">
                <User className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="hidden md:block text-sm font-medium text-white">Developer</span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", userMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56"
                >
                  <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}>
                    <div className="px-4 py-3 border-b border-white/[0.08]">
                      <p className="text-sm font-medium text-white">Developer</p>
                      <p className="text-xs text-zinc-500 truncate">developer@cloudscale.local</p>
                    </div>
                    <nav className="py-1">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </nav>
                    <div className="border-t border-white/[0.08] p-1" />
                    <Link
                      href="/auth/signin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF3366] hover:text-[#FF6688] hover:bg-[#FF3366]/10 transition-colors rounded-none"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}