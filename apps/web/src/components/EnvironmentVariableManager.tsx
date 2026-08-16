"use client";

import React, { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Key, Eye, EyeOff, Loader2, Check, AlertCircle, Trash2, Copy, CheckCircle2, Shield } from "lucide-react";
import { cn, componentStyles } from "@/lib/design-system";

interface EnvVar {
  id: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

interface EnvironmentVariableManagerProps {
  projectId: string;
  initialEnvVars?: EnvVar[];
  onEnvVarsChange?: () => void;
}

export function EnvironmentVariableManager({
  projectId,
  initialEnvVars = [],
  onEnvVarsChange,
}: EnvironmentVariableManagerProps) {
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editValue, setEditValue] = useState("");
  const [showValue, setShowValue] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const validateKey = (key: string): string | null => {
    if (!key.trim()) return "Key is required";
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return "Invalid format. Use letters, numbers, underscores. Must start with letter or underscore.";
    }
    return null;
  };

  const validateValue = (value: string): string | null => {
    if (!value.trim()) return "Value is required";
    return null;
  };

  const refreshEnvVars = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/projects/${projectId}/env`, {
        signal: abortControllerRef.current.signal,
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEnvVars(data.envVars || []);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      showToast("Failed to load environment variables", "error");
    }
  }, [projectId, showToast]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({});

    const keyError = validateKey(newKey);
    const valueError = validateValue(newValue);

    if (keyError || valueError) {
      setErrors({ key: keyError || "", value: valueError || "" });
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/env`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey.trim(), value: newValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add environment variable");
      }

      setNewKey("");
      setNewValue("");
      await refreshEnvVars();
      onEnvVarsChange?.();
      showToast("Environment variable added successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add environment variable";

      if (message.includes("already exists")) {
        setErrors({ key: "This key already exists" });
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async (envVarId: string) => {
    setErrors({});

    const valueError = validateValue(editValue);
    if (valueError) {
      setErrors({ value: valueError });
      return;
    }

    setIsEditing(envVarId);
    try {
      const res = await fetch(`/api/projects/${projectId}/env/${envVarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }

      setIsEditing(null);
      setEditValue("");
      showToast("Environment variable updated", "success");
      refreshEnvVars();
      onEnvVarsChange?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update";
      if (message.includes("already exists")) {
        setErrors({ key: "This key already exists" });
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsEditing(null);
    }
  };

  const handleDelete = async (envVarId: string, key: string) => {
    if (!confirm(`Delete "${key}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/env/${envVarId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      showToast("Environment variable deleted", "success");
      refreshEnvVars();
      onEnvVarsChange?.();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  useEffect(() => {
    refreshEnvVars();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refreshEnvVars]);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied`, "success");
  };

  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "overflow-hidden")}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Environment Variables</h3>
            <p className="text-xs text-zinc-500">{envVars.length} variable{envVars.length !== 1 ? "s" : ""} configured</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowAddForm(true); setErrors({}); setNewKey(""); setNewValue(""); }}
          className={cn("flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5")}
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </motion.button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
              "px-4 py-3 border-b border-white/10 flex items-center justify-between",
              toast.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-sm">
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-white/5">
        {envVars.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center text-zinc-500"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
              <Shield className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-white mb-1">No environment variables</p>
            <p className="text-xs text-zinc-600">Add variables to make them available during deployments. Values are encrypted at rest using AES-256-GCM.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowAddForm(true); setErrors({}); setNewKey(""); setNewValue(""); }}
              className="mt-4 flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Variable
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {envVars.map((envVar) => (
            <motion.div
              key={envVar.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 flex-shrink-0">
                  <Key className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono text-sm text-white bg-white/[0.03] px-2 py-1 rounded border border-white/10 truncate max-w-xs">
                      {envVar.key}
                    </code>
                    {isEditing === envVar.id && (
                      <span className="text-xs text-emerald-400 font-medium">Editing...</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Updated {formatDate(envVar.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditing === envVar.id ? (
                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type={showValue === envVar.id ? "text" : "password"}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter new value"
                        className={cn(
                          "w-full bg-[#030303] border rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10"
                        )}
                        autoFocus
                      />
                      <button
                        onClick={() => setShowValue(showValue === envVar.id ? null : envVar.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        aria-label={showValue === envVar.id ? "Hide value" : "Show value"}
                      >
                        {showValue === envVar.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEdit(envVar.id)}
                      className={cn("flex items-center gap-1.5", componentStyles.button.primary)}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setIsEditing(null); setEditValue(""); }}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg"
                      aria-label="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setIsEditing(envVar.id); setShowValue(envVar.id); }}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg"
                      aria-label="Edit value"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(envVar.key, "Key")}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg"
                      aria-label="Copy key"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(envVar.id, envVar.key)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      aria-label={`Delete ${envVar.key}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="p-4 space-y-4 border-t border-white/5 bg-white/[0.01]"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="DATABASE_URL"
                    className={cn(
                      "w-full bg-[#030303] border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                      errors.key ? "border-red-500" : "border-white/10"
                    )}
                    autoFocus
                  />
                </div>
                {errors.key && <p className="text-xs text-red-400 mt-1">{errors.key}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Value</label>
                <div className="relative">
                  <input
                    type={showValue === "add" ? "text" : "password"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter secret value"
                    className={cn(
                      "w-full bg-[#030303] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12",
                      errors.value ? "border-red-500" : "border-white/10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowValue(showValue === "add" ? null : "add")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    aria-label={showValue === "add" ? "Hide value" : "Show value"}
                  >
                    {showValue === "add" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewKey(""); setNewValue(""); setErrors({}); }}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isAdding}
                  className={cn(
                    "flex items-center gap-1.5",
                    componentStyles.button.primary,
                    "disabled:opacity-50"
                  )}
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isAdding ? "Adding..." : "Add Variable"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}