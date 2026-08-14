"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, XCircle, WifiOff, TerminalSquare, 
  Pause, Play, Copy, Trash2, Download, Maximize2, Minimize2,
  ChevronDown, X
} from "lucide-react";
import { cn } from "@/lib/design-system";
import { useReducedMotion } from "@/hooks/useMousePosition";

interface DeploymentLogViewerProps {
  deploymentId: string;
  onClose: () => void;
  initialLogs?: string;
}

interface LogLine {
  id: number;
  content: string;
  timestamp?: string;
  type?: "stdout" | "stderr" | "system" | "error";
}

export function DeploymentLogViewer({
  deploymentId,
  onClose,
  initialLogs,
}: DeploymentLogViewerProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [filterLevel, setFilterLevel] = useState<"all" | "stdout" | "stderr" | "error">("all");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const reducedMotion = useReducedMotion();
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const lineIdRef = useRef(0);
  const pendingLogsRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const detectLogType = (line: string): LogLine["type"] => {
    const lower = line.toLowerCase();
    if (lower.includes("error") || lower.includes("fail") || lower.includes("exception")) return "error";
    if (lower.includes("warn")) return "stderr";
    return "stdout";
  };

  // Initialize with historical logs
  useEffect(() => {
    if (initialLogs) {
      const lines = initialLogs.split("\n").filter(Boolean);
      const parsedLogs: LogLine[] = lines.map((line) => ({
        id: lineIdRef.current++,
        content: line,
        type: detectLogType(line),
      }));
      setLogs(parsedLogs);
    }
  }, [initialLogs]);

  const flushPendingLogs = useCallback(() => {
    if (pendingLogsRef.current.length > 0 && isMountedRef.current) {
      const newLogs: LogLine[] = pendingLogsRef.current.map((line) => ({
        id: lineIdRef.current++,
        content: line,
        timestamp: new Date().toISOString(),
        type: detectLogType(line),
      }));
      setLogs((prev) => [...prev, ...newLogs]);
      pendingLogsRef.current = [];
    }
  }, []);

  const addLogBatch = useCallback((lines: string[]) => {
    pendingLogsRef.current.push(...lines);
    if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    flushTimeoutRef.current = setTimeout(flushPendingLogs, 50);
  }, [flushPendingLogs]);

  useEffect(() => {
    isMountedRef.current = true;

    const eventSource = new EventSource(`/api/deployments/${deploymentId}/logs`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (isMountedRef.current) {
        setConnectionStatus("connected");
        setError(null);
      }
    };

    eventSource.addEventListener("historical", (event) => {
      if (isMountedRef.current && event.data) {
        const lines = event.data.split("\n").filter(Boolean);
        addLogBatch(lines);
      }
    });

    eventSource.addEventListener("connected", (event) => {
      if (isMountedRef.current) {
        console.log("SSE connected:", event.data);
      }
    });

    eventSource.onmessage = (event) => {
      if (isMountedRef.current && event.data) {
        addLogBatch([event.data]);
      }
    };

    eventSource.onerror = () => {
      if (isMountedRef.current) {
        setConnectionStatus("error");
        setError("Connection lost. Attempting to reconnect...");
        eventSource.close();
      }
    };

    return () => {
      isMountedRef.current = false;
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [deploymentId, addLogBatch]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === "all") return true;
    return log.type === filterLevel;
  });

  const clearLogs = () => {
    setLogs([]);
    lineIdRef.current = 0;
  };

  const copyLogs = async () => {
    const text = filteredLogs.map((log) => log.content).join("\n");
    await navigator.clipboard.writeText(text);
  };

  const downloadLogs = () => {
    const text = filteredLogs.map((log) => log.content).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-${deploymentId.slice(0, 8)}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "connecting":
        return { icon: <Loader2 className="w-3 h-3 animate-spin" />, text: "Connecting...", color: "text-amber-400", bg: "bg-amber-500/10" };
      case "connected":
        return { icon: <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />, text: "Live", color: "text-emerald-400", bg: "bg-emerald-500/10" };
      case "disconnected":
        return { icon: <WifiOff className="w-3 h-3" />, text: "Disconnected", color: "text-zinc-500", bg: "bg-zinc-500/10" };
      case "error":
        return { icon: <XCircle className="w-3 h-3" />, text: "Error", color: "text-red-400", bg: "bg-red-500/10" };
    }
  };

  const statusConfig = getStatusConfig();

  const motionProps = reducedMotion
    ? { initial: false, animate: false, exit: false }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
      };

  return (
    <motion.div
      {...motionProps}
      className={cn(
        "bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col",
        "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]",
        isExpanded ? "fixed inset-4 z-50 max-w-none h-[calc(100vh-2rem)]" : "h-[600px] w-full max-w-4xl"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
            <TerminalSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Deployment Logs</h3>
            <p className="text-xs text-zinc-500 font-mono">{deploymentId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full", statusConfig.color, statusConfig.bg)}>
            {statusConfig.icon}
            {statusConfig.text}
          </span>

          {/* Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
            className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            aria-label="Filter logs"
          >
            <option value="all">All</option>
            <option value="stdout">Output</option>
            <option value="stderr">Warnings</option>
            <option value="error">Errors</option>
          </select>

          {/* Timestamps Toggle */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={cn("p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors", showTimestamps && "text-blue-400 bg-blue-500/10")}
            aria-label={showTimestamps ? "Hide timestamps" : "Show timestamps"}
            aria-pressed={showTimestamps}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn("p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1", autoScroll ? "text-emerald-400" : "text-amber-400")}
            aria-label={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            aria-pressed={autoScroll}
          >
            {autoScroll ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">Auto</span>
          </button>

          {/* Actions */}
          <button onClick={copyLogs} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Copy logs">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={downloadLogs} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Download logs">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearLogs} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" aria-label="Clear logs">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors" aria-label={isExpanded ? "Minimize" : "Maximize"}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close logs">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={reducedMotion ? false : { opacity: 1, height: "auto" }}
          className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Log Container */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-[#050505]"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
          if (!autoScroll && isAtBottom) setAutoScroll(true);
          if (autoScroll && !isAtBottom) setAutoScroll(false);
        }}
      >
<AnimatePresence mode="popLayout">
          {filteredLogs.length === 0 ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              exit={reducedMotion ? false : { opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-full text-zinc-600"
            >
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-zinc-500" />
              <p className="text-sm">Waiting for logs...</p>
              <p className="text-xs text-zinc-700 mt-1">Logs will appear here once the deployment starts</p>
            </motion.div>
          ) : (
            <div className="font-mono text-[12px] leading-relaxed">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={reducedMotion ? false : { opacity: 1, x: 0 }}
                  exit={reducedMotion ? false : { opacity: 0, x: 10 }}
                  transition={reducedMotion ? false : { duration: 0.15 }}
                  className={cn(
                    "px-2 py-0.5 border-l-2 transition-colors",
                    "hover:bg-white/[0.02]",
                    log.type === "error" ? "border-red-500/50" :
                    log.type === "stderr" ? "border-amber-500/50" :
                    "border-transparent"
                  )}
                  style={{ borderLeftWidth: log.type === "error" ? "3px" : "2px" }}
                >
                  <span className="flex items-baseline gap-2 min-w-0">
                    {showTimestamps && log.timestamp && (
                      <span className="text-zinc-600 font-mono text-[11px] flex-shrink-0 mr-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    <span 
                      className={cn(
                        "whitespace-pre-wrap break-words",
                        log.type === "error" ? "text-red-300" :
                        log.type === "stderr" ? "text-amber-300" :
                        "text-zinc-200"
                      )}
                    >
                      {log.content || <span className="text-zinc-800">��</span>}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Auto-scroll indicator when not at bottom */}
        {!autoScroll && filteredLogs.length > 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
            onClick={() => setAutoScroll(true)}
          >
            <button className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors">
              <ChevronDown className="w-3 h-3" />
              New logs available
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-zinc-500">
        <span>{filteredLogs.length} line{filteredLogs.length !== 1 ? "s" : ""} {filterLevel !== "all" ? `(${filterLevel})` : ""}</span>
        <span className="flex items-center gap-2">
          {connectionStatus === "connected" && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Streaming
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}