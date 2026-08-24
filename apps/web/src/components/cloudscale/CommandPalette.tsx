"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command, ArrowRight, GitBranch, Server, Terminal, Settings, Plus, RotateCcw, Trash2, Key, Globe, FolderGit2, GitBranch as GitBranchIcon, LayoutDashboard, Activity } from "lucide-react";
import { cn, componentStyles } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/cloudscale/ToastProvider";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    {
      id: "new-project",
      label: "Create New Project",
      description: "Deploy a new repository from GitHub",
      icon: <Plus className="w-4 h-4" />,
      shortcut: "⌘N",
      keywords: ["new", "create", "project", "deploy", "github"],
      action: () => router.push("/dashboard/projects/new"),
    },
    {
      id: "projects",
      label: "View All Projects",
      description: "Browse and manage your projects",
      icon: <FolderGit2 className="w-4 h-4" />,
      shortcut: "⌘1",
      keywords: ["projects", "list", "browse", "manage"],
      action: () => router.push("/dashboard/projects"),
    },
    {
      id: "deployments",
      label: "View All Deployments",
      description: "Browse deployment history and status",
      icon: <Server className="w-4 h-4" />,
      shortcut: "⌘2",
      keywords: ["deployments", "history", "status", "logs"],
      action: () => router.push("/dashboard/deployments"),
    },
    {
      id: "dashboard",
      label: "Go to Dashboard",
      description: "Return to the main dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: "⌘D",
      keywords: ["dashboard", "home", "overview", "stats"],
      action: () => router.push("/dashboard"),
    },
    {
      id: "settings",
      label: "Open Settings",
      description: "Manage your account and preferences",
      icon: <Settings className="w-4 h-4" />,
      shortcut: "⌘,",
      keywords: ["settings", "preferences", "account", "profile"],
      action: () => router.push("/dashboard/settings"),
    },
    {
      id: "new-deployment",
      label: "Trigger New Deployment",
      description: "Deploy the latest code for current project",
      icon: <RotateCcw className="w-4 h-4" />,
      shortcut: "⌘R",
      keywords: ["deploy", "redeploy", "restart", "build"],
      action: () => {
        addToast({ message: "Navigate to a project to trigger deployment", type: "info" });
      },
    },
  ];

  const filteredCommands = commands
    .filter((cmd) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(q))
      );
    })
    .slice(0, 8);

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (itemsRef.current) {
      const items = itemsRef.current.querySelectorAll('[role="option"]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, filteredCommands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setQuery("");
          setSelectedIndex(0);
        }
        break;
    }
  };

  const renderCommands = () => {
    if (filteredCommands.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-zinc-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm">No commands found</p>
          <p className="text-xs text-zinc-600 mt-1">Try a different search term</p>
        </div>
      );
    }

    return (
      <>
        {filteredCommands.map((cmd, index) => (
          <motion.button
            key={cmd.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.15, delay: index * 0.02 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              cmd.action();
              setIsOpen(false);
              setQuery("");
              setSelectedIndex(0);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
              index === selectedIndex
                ? "bg-white/5 text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
            role="option"
            aria-selected={index === selectedIndex}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                cmd.action();
                setIsOpen(false);
                setQuery("");
                setSelectedIndex(0);
              }
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 shrink-0">
              {cmd.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{cmd.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{cmd.description}</p>
            </div>
            {cmd.shortcut && (
              <kbd className="px-2 py-1 text-[10px] font-mono text-zinc-500 bg-white/[0.05] rounded">
                {cmd.shortcut}
              </kbd>
            )}
          </motion.button>
        ))}
      </>
    );
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => { setIsOpen(false); setQuery(""); setSelectedIndex(0); }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "rounded-2xl overflow-hidden")}>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="flex-1 relative">
                  <Command className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className={cn(
                      "w-full bg-[#030303] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    )}
                    autoFocus
                    aria-label="Command search"
                  />
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-mono text-zinc-500 bg-white/[0.05] rounded">
                    <span>⌘</span>K
                  </kbd>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setIsOpen(false); setQuery(""); setSelectedIndex(0); }}
                  className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-h-96 overflow-y-auto"
                  ref={itemsRef}
                  role="listbox"
                  aria-label="Commands"
                >
                  {filteredCommands.length === 0 ? (
                    <div className="px-4 py-8 text-center text-zinc-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                      <p className="text-sm">No commands found</p>
                      <p className="text-xs text-zinc-600 mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-h-96 overflow-y-auto"
                      ref={itemsRef}
                      role="listbox"
                      aria-label="Commands"
                    >
                      {filteredCommands.map((cmd, index) => (
                        <motion.button
                          key={cmd.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            cmd.action();
                            setIsOpen(false);
                            setQuery("");
                            setSelectedIndex(0);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                            index === selectedIndex
                              ? "bg-white/5 text-white"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                          role="option"
                          aria-selected={index === selectedIndex}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              cmd.action();
                              setIsOpen(false);
                              setQuery("");
                              setSelectedIndex(0);
                            }
                          }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 shrink-0">
                            {cmd.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{cmd.label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{cmd.description}</p>
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-2 py-1 text-[10px] font-mono text-zinc-500 bg-white/[0.05] rounded">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-zinc-500">
                <span>Use ↑↓ to navigate, ↵ to select, ⎋ to close</span>
                <span className="flex items-center gap-1">
                  <Command className="w-3.5 h-3.5" />
                  K
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
