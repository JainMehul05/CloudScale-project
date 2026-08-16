"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  Shield,
  Bell,
  Palette,
  Trash2,
  LogOut,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GitBranch,
  ArrowLeft,
  RotateCcw,
  X,
  Activity,
} from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn, componentStyles } from "@/lib/design-system";

type Tab = "account" | "security" | "notifications" | "appearance" | "danger";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Account form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [deploymentNotifications, setDeploymentNotifications] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  
  // Appearance
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [compactMode, setCompactMode] = useState(false);

  const themeOptions = [
    { value: "system", label: "System", description: "Match OS preference" },
    { value: "light", label: "Light", description: "Always use light mode" },
    { value: "dark", label: "Dark", description: "Always use dark mode" },
  ] as const;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
            createdAt: new Date().toISOString(),
          });
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, []);

  const handleAccountUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      showToast("Profile updated successfully", "success");
    } catch {
      showToast("Failed to update profile", "error");
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
      showToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to change password", "error");
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm("Revoke all other sessions? You'll need to sign in again on other devices.")) return;
    try {
      const res = await fetch("/api/auth/revoke-sessions", { method: "POST" });
      if (!res.ok) throw new Error("Failed to revoke sessions");
      showToast("All other sessions revoked", "success");
    } catch {
      showToast("Failed to revoke sessions", "error");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = "DELETE MY ACCOUNT";
    const input = prompt(`This action is irreversible. Type "${confirmText}" to confirm:`);
    if (input !== confirmText) return;
    
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await signOut({ callbackUrl: "/" });
    } catch {
      showToast("Failed to delete account", "error");
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "account", label: "Account", icon: <User className="w-4 h-4" />, description: "Manage your profile and account settings" },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" />, description: "Password, sessions, and authentication" },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, description: "Configure email and deployment alerts" },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" />, description: "Theme, layout, and display preferences" },
    { id: "danger", label: "Danger Zone", icon: <Trash2 className="w-4 h-4" />, description: "Irreversible destructive actions" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#030303] text-zinc-300">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#030303]/95 backdrop-blur-xl"
      >
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <CloudScaleLogo size="md" showText textSize="lg" className="text-white" />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Settings
          </p>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                activeTab === tab.id
                  ? "bg-white/[0.04] text-white border border-white/5"
                  : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"
              )}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 flex-shrink-0">
                {tab.icon}
              </span>
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white font-medium shadow-inner">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white leading-tight truncate">{user?.email || "Loading..."}</span>
              <span className="text-xs text-zinc-500">Free Tier</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 w-full flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative ml-64">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <header className="flex h-16 shrink-0 items-center justify-between px-8 border-b border-white/10 bg-[#030303]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <span className="font-medium text-white">Settings</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{user?.name || user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white font-medium">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="mt-1 text-zinc-400">
                  {tabs.find(t => t.id === activeTab)?.description}
                </p>
              </div>
            </motion.div>

            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "fixed top-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-xl border",
                  "animate-in fade-in duration-200",
                  toast.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {toast.message}
                </span>
                <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
                  <form onSubmit={handleAccountUpdate} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className={cn(componentStyles.input.base, "pl-9")}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={cn(componentStyles.input.base, "pl-9")}
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={cn("flex items-center gap-2", componentStyles.button.primary)}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </motion.button>
                  </form>
                </div>

                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-4">Connected Accounts</h2>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">GitHub</p>
                        <p className="text-xs text-zinc-500">Connected for deployments</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">Connected</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(componentStyles.input.base, "pl-9 pr-12")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          className={cn(componentStyles.input.base, "pl-9 pr-12")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(componentStyles.input.base, "pl-9 pr-12")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={cn("flex items-center gap-2", componentStyles.button.primary)}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Update Password
                    </motion.button>
                  </form>
                </div>

                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-4">Active Sessions</h2>
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Current Session</p>
                          <p className="text-xs text-zinc-500">This device · Active now</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">Current</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRevokeSessions}
                    className="mt-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revoke All Other Sessions
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-6">Email Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { key: "deploymentNotifications", label: "Deployment Updates", description: "Get notified when deployments start, succeed, or fail" },
                      { key: "securityNotifications", label: "Security Alerts", description: "Receive alerts for suspicious activity and password changes" },
                      { key: "emailNotifications", label: "Product Updates", description: "Occasional emails about new features and improvements" },
                    ].map((item) => {
                      const checked = item.key === "deploymentNotifications" ? deploymentNotifications : 
                                       item.key === "securityNotifications" ? securityNotifications : emailNotifications;
                      const setChecked = item.key === "deploymentNotifications" ? setDeploymentNotifications :
                                        item.key === "securityNotifications" ? setSecurityNotifications : setEmailNotifications;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                          <div>
                            <p className="font-medium text-white">{item.label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setChecked(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:bg-blue-500 peer-checked:border-blue-500 border border-white/10 transition-colors"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-6">Theme</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "p-6 rounded-xl border-2 transition-all text-left",
                          theme === option.value
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                        )}
                      >
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-xs text-zinc-500 mt-1">{option.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-6")}>
                  <h2 className="text-lg font-semibold text-white mb-6">Layout</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Compact Mode</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Reduce spacing for denser information display</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={compactMode}
                          onChange={(e) => setCompactMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:bg-blue-500 peer-checked:border-blue-500 border border-white/10 transition-colors"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn(componentStyles.card.base, "border-red-500/20", "p-6")}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
                      <p className="text-sm text-zinc-500">Irreversible destructive actions</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-6">
                    Once you delete your account, there is no going back. All your projects, deployments, 
                    environment variables, and data will be permanently removed.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    className={cn("flex items-center gap-2", componentStyles.button.danger)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}