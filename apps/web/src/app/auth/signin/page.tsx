"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn, componentStyles } from "@/lib/design-system";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CloudScaleLogo size="lg" showText textSize="xl" className="mx-auto mb-4" />
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-zinc-400">Sign in to your CloudScale account</p>
        </div>

        <div className={cn(componentStyles.card.base, componentStyles.card.hover, componentStyles.card.elevated, "p-8")}>
          {(error || formError) && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
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
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={cn(componentStyles.input.base, "pl-9")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn("w-full flex items-center justify-center gap-2", componentStyles.button.primary, "disabled:opacity-50 disabled:cursor-not-allowed")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Do not have an account?{" "}
            <a href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#030303] px-4"><div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>}>
      <SignInContent />
    </Suspense>
  );
}