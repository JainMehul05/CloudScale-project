"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, User } from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn, componentStyles } from "@/lib/design-system";
import { useMousePosition, useReducedMotion } from "@/hooks/useMousePosition";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#00E5FF]">
      {children}
    </span>
  );
}

function MouseFollowGlow({ className, intensity = 1, color = "cyan" }: { className?: string; intensity?: number; color?: "cyan" | "purple" | "blue" }) {
  const { normalizedX, normalizedY } = useMousePosition();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  const x = `${50 + normalizedX * 15 * intensity}%`;
  const y = `${50 + normalizedY * 15 * intensity}%`;

  const colors = {
    cyan: "bg-[#00E5FF]/20",
    purple: "bg-[#8B5CF6]/20",
    blue: "bg-[#2563FF]/20",
  };

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-[110px] transition-all duration-300 ease-out", colors[color], className ?? "")}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        willChange: "transform",
      }}
    />
  );
}

function GridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-grid-cyan"
      style={{
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)",
      }}
    />
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Registration failed");
        return;
      }

      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=true`);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reducedMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-md">
      {/* Header */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className="mx-auto mb-6"
        >
          <CloudScaleLogo size="lg" showText textSize="xl" className="mx-auto" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionEyebrow>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="h-2 w-2 rounded-full bg-[#00FF9C] animate-pulse-glow"
            />
            CloudScale
          </SectionEyebrow>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Initialize Workspace
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 text-base text-zinc-400"
        >
          Join CloudScale to start deploying
        </motion.p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          componentStyles.card.base,
          componentStyles.card.hover,
          componentStyles.card.elevated,
          "p-8 relative overflow-hidden"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        />

        <div className="relative z-10">
          {/* Error Messages */}
          <AnimatePresence mode="popLayout">
            {(error || formError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-2 p-3 rounded-lg"
              >
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-[#FF3366]/10 border border-[#FF3366]/20 rounded-lg text-[#FF3366] text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-[#FF3366]/10 border border-[#FF3366]/20 rounded-lg text-[#FF3366] text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Name (optional)
              </label>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(componentStyles.input.base, "pl-9")}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={cn(componentStyles.input.base, "pl-9 pr-10")}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={cn(componentStyles.input.base, "pl-9 pr-10")}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                componentStyles.button.primary,
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                "Create Workspace"
              )}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 text-center text-sm text-zinc-500"
          >
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-[#00E5FF] hover:text-[#00B8D4] font-medium transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

function RegisterContent() {
  return (
    <Suspense fallback={<div className="relative w-full max-w-md" />}>
      <RegisterForm />
    </Suspense>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] px-4 overflow-hidden">
      <MouseFollowGlow className="h-[500px] w-[700px]" intensity={1} color="cyan" />
      <MouseFollowGlow className="h-[300px] w-[300px] left-1/4 top-1/4" intensity={0.8} color="purple" />
      <MouseFollowGlow className="h-[260px] w-[260px] right-1/4 top-64" intensity={0.6} color="blue" />

      <GridBackground />

      <div className="relative w-full max-w-md">
        <RegisterContent />
      </div>
    </div>
  );
}