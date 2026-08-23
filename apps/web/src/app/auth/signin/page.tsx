"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
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

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setFormError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
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
          Welcome back
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 text-base text-zinc-400"
        >
          Access your cloud control center
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
          {/* Error/Success Messages */}
          <AnimatePresence mode="popLayout">
            {(registered || error || formError) && (
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
                {registered && (
                  <div className="flex items-center gap-2 p-3 bg-[#00FF9C]/10 border border-[#00FF9C]/20 rounded-lg text-[#00FF9C] text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Account created! Please sign in.
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
              transition={{ duration: 0.4, delay: 0.15 }}
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
                  Signing in...
                </>
              ) : (
                "Enter CloudScale"
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 text-center text-sm text-zinc-500"
          >
            Do not have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#00E5FF] hover:text-[#00B8D4] font-medium transition-colors"
            >
              Initialize workspace
            </Link>
          </motion.p>
        </div>

        {/* OAuth Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="relative mt-10"
        >
          <div className="relative flex items-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-zinc-600">
              <span className="bg-[#0D0D12] px-4 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02]",
                "text-sm font-medium text-zinc-300 transition-all duration-200",
                "hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02]",
                "text-sm font-medium text-zinc-300 transition-all duration-200",
                "hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SignInContent() {
  return (
    <Suspense fallback={<div className="relative w-full max-w-md" />}>
      <SignInForm />
    </Suspense>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] px-4 overflow-hidden">
      <MouseFollowGlow className="h-[500px] w-[700px]" intensity={1} color="cyan" />
      <MouseFollowGlow className="h-[300px] w-[300px] left-1/4 top-1/4" intensity={0.8} color="purple" />
      <MouseFollowGlow className="h-[260px] w-[260px] right-1/4 top-64" intensity={0.6} color="blue" />

      <GridBackground />

      <div className="relative w-full max-w-md">
        <SignInContent />
      </div>
    </div>
  );
}