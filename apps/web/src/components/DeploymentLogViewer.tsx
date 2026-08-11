"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, XCircle, WifiOff, TerminalSquare } from "lucide-react";

interface DeploymentLogViewerProps {
  deploymentId: string;
  onClose: () => void;
  initialLogs?: string;
}

export function DeploymentLogViewer({
  deploymentId,
  onClose,
  initialLogs,
}: DeploymentLogViewerProps) {
  const [logs, setLogs] = useState<string>(initialLogs || "");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const eventSource = new EventSource(
      `/api/deployments/${deploymentId}/logs`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (isMountedRef.current) {
        setConnectionStatus("connected");
      }
    };

    eventSource.addEventListener("historical", (event) => {
      if (isMountedRef.current) {
        setLogs((prev) => prev + event.data + "\n");
      }
    });

    eventSource.addEventListener("connected", (event) => {
      if (isMountedRef.current) {
        console.log("SSE connected:", event.data);
      }
    });

    eventSource.onmessage = (event) => {
      if (isMountedRef.current) {
        setLogs((prev) => prev + event.data + "\n");
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
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [deploymentId]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connecting":
        return <Loader2 className="w-4 h-4 animate-spin text-amber-400" />;
      case "connected":
        return <WifiOff className="w-4 h-4 text-emerald-400" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-zinc-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Live";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Error";
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connecting":
        return "text-amber-400";
      case "connected":
        return "text-emerald-400";
      case "disconnected":
        return "text-zinc-500";
      case "error":
        return "text-red-400";
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col h-[500px] w-full max-w-3xl">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">Deployment Logs</h3>
            <p className="text-xs text-zinc-500">Deployment: {deploymentId.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close logs"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm text-zinc-300 bg-[#0a0a0a]"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
      >
        {logs.split("\n").map((line, index) => (
          <div key={index} className="whitespace-pre-wrap text-[13px] leading-relaxed">
            {line || <span className="text-zinc-700">‧</span>}
          </div>
        ))}
        {!logs && (
          <div className="text-zinc-600 text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
            <p>Waiting for logs...</p>
          </div>
        )}
      </div>
    </div>
  );
}