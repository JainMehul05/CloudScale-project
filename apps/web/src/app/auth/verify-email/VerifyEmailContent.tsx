"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
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

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const verifyEmail = async () => {
      if (!token) {
        if (mounted) {
          setStatus("error");
          setMessage("No verification token provided");
        }
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!mounted) return;

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch {
        if (mounted) {
          setStatus("error");
          setMessage("Something went wrong. Please try again.");
        }
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="relative w-full max-w-md">
      <MouseFollowGlow className="h-[500px] w-[700px]" intensity={1} color="cyan" />
      <MouseFollowGlow className="h-[300px] w-[300px] left-1/4 top-1/4" intensity={0.8} color="purple" />
      <MouseFollowGlow className="h-[260px] w-[260px] right-1/4 top-64" intensity={0.6} color="blue" />

      <GridBackground />

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
          Verify Your Email
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 text-base text-zinc-400"
        >
          Complete your CloudScale account setup
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

        <div className="relative z-10 text-center">
          <AnimatePresence mode="popLayout">
            {status === "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="mx-auto mb-6">
                  <Loader2 className="w-16 h-16 animate-spin text-[#00E5FF] mx-auto" />
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-zinc-300"
                >
                  Verifying your email address...
                </motion.p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="mx-auto mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00FF9C]/10">
                    <CheckCircle2 className="w-8 h-8 text-[#00FF9C]" />
                  </div>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-semibold text-white"
                >
                  Email Verified!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-zinc-400"
                >
                  {message}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <Link
                    href="/auth/signin?verified=true"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                      componentStyles.button.primary
                    )}
                  >
                    <Mail className="w-4 h-4" />
                    Sign In to CloudScale
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="mx-auto mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF3366]/10">
                    <AlertCircle className="w-8 h-8 text-[#FF3366]" />
                  </div>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-semibold text-white"
                >
                  Verification Failed
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[#FF3366]"
                >
                  {message}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex flex-col gap-3"
                >
                  <Link
                    href="/auth/register"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                      componentStyles.button.primary
                    )}
                  >
                    <Mail className="w-4 h-4" />
                    Create New Account
                  </Link>
                  <Link
                    href="/auth/signin"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                      componentStyles.button.secondary
                    )}
                  >
                    Already have an account? Sign In
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}