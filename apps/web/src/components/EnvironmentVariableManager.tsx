"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Plus, X, Key, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";

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
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editValue, setEditValue] = useState("");
  const [showValue, setShowValue] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = React.useCallback((message: string, type: "success" | "error") => {
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

  const refreshEnvVars = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/env`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEnvVars(data.envVars || []);
    } catch {
      showToast("Failed to load environment variables", "error");
    }
  };

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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add");
      }

      setNewKey("");
      setNewValue("");
      showToast("Environment variable added", "success");
      refreshEnvVars();
      onEnvVarsChange?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add";
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
    let cancelled = false;

    fetch(`/api/projects/${projectId}/env`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEnvVars(data.envVars || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          showToast("Failed to load environment variables", "error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, showToast]);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Environment Variables</h3>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setErrors({});
            setNewKey("");
            setNewValue("");
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>

      {toast && (
        <div className={`px-4 py-2 border-b border-white/10 flex items-center justify-between ${
          toast.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        }`}>
          <span className="flex items-center gap-2 text-sm">
            {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {envVars.length === 0 && !isAdding && (
          <div className="p-8 text-center text-zinc-500">
            <Key className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm">No environment variables configured</p>
            <p className="text-xs text-zinc-600 mt-1">Add variables to make them available during deployments</p>
          </div>
        )}

        {envVars.map((envVar) => (
          <div key={envVar.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm text-white bg-white/[0.03] px-2 py-1 rounded border border-white/10">
                  {envVar.key}
                </code>
                {isEditing === envVar.id && (
                  <span className="text-xs text-emerald-400">Editing...</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Updated {formatDate(envVar.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing === envVar.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type={showValue === envVar.id ? "text" : "password"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter new value"
                    className="w-64 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowValue(showValue === envVar.id ? null : envVar.id)}
                    className="p-1.5 text-zinc-500 hover:text-white"
                    aria-label="Toggle visibility"
                  >
                    {showValue === envVar.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(envVar.id)}
                    disabled={isEditing !== envVar.id}
                    className="flex items-center gap-1.5 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    onClick={() => { setIsEditing(null); setEditValue(""); }}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsEditing(envVar.id); setShowValue(envVar.id); }}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded"
                  aria-label="Edit"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(envVar.id, envVar.key)}
                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                aria-label="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {isAdding && (
          <form onSubmit={handleAdd} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="DATABASE_URL"
                className={`w-full bg-[#0a0a0a] border rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.key ? "border-red-500" : "border-white/10"
                }`}
              />
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
                  className={`w-full bg-[#0a0a0a] border rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10 ${
                    errors.value ? "border-red-500" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowValue(showValue === "add" ? null : "add")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showValue === "add" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setNewKey(""); setNewValue(""); setErrors({}); }}
                className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 bg-gradient-to-b from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isAdding ? "Adding..." : "Add Variable"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}