"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn } from "@/lib/design-system";

const GITHUB_URL = "https://github.com/JainMehul05/cloudscale-test-app";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Documentation", href: "#docs" },
  { label: "GitHub", href: GITHUB_URL, external: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        style={{ scaleX: scrolled ? 1 : 0 }}
        className="
        fixed top-0 left-0 right-0 z-[100]
        h-[2px] origin-left
        bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500
        transition-transform duration-300 ease-out
        "
      />

      <header className="sticky top-0 z-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "mx-auto mt-4 max-w-7xl",
            "flex items-center justify-between",
            "rounded-2xl border px-4 py-3",
            "backdrop-blur-xl transition-all duration-300",
            scrolled
              ? "bg-[#030303]/90 border-white/[0.08] shadow-[0_12px_16px_-4px_rgba(0,0,0,0.5)]"
              : "bg-[#030303]/60 border-white/[0.04]"
          )}
        >
          <Link href="/" className="flex items-center gap-3 text-white" aria-label="CloudScale Home">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="h-9 w-9 rounded-xl overflow-hidden"
            >
              <CloudScaleLogo size="md" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">CloudScale</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white rounded-lg hover:bg-white/[0.03]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <div className="w-px h-6 bg-white/[0.08] mx-2" />
            <Link
              href="/auth/signin"
              className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/[0.03]"
            >
              Login
            </Link>
            <motion.a
              href="/auth/signin"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group flex items-center gap-2",
                "rounded-xl bg-gradient-to-b from-blue-500 to-cyan-600",
                "hover:from-blue-400 hover:to-cyan-500",
                "px-5 py-2.5 text-sm font-semibold text-white",
                "shadow-[0_0_24px_-6px_rgba(59,130,246,0.4)]",
                "transition-all duration-200"
              )}
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-zinc-300 hover:text-white p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#030303]/95 p-4 backdrop-blur-xl">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="block rounded-xl px-3 py-3 text-sm text-zinc-300 hover:bg-white/[0.03] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 border-t border-white/[0.08] pt-3 space-y-3">
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="block text-center py-3 text-zinc-300 hover:text-white transition-colors rounded-xl hover:bg-white/[0.03]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-gradient-to-b from-blue-500 to-cyan-600 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}