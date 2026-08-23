"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";
import { cn } from "@/lib/design-system";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Technology", href: "#technology" },
  { label: "Security", href: "#security" },
  { label: "Changelog", href: "/changelog" },
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
      {/* Top Progress Bar */}
      <motion.div
        style={{ scaleX: scrolled ? 1 : 0 }}
        className="
        fixed top-0 left-0 right-0 z-[100]
        h-[2px] origin-left
        bg-gradient-to-r from-[#00E5FF] via-[#2563FF] to-[#8B5CF6]
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
              ? "bg-[#050505]/95 border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_16px_-4px_rgba(0,0,0,0.5)]"
              : "bg-[#050505]/60 border-white/[0.04]"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-white" aria-label="CloudScale Home">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="h-10 w-10 rounded-xl overflow-hidden"
            >
              <CloudScaleLogo size="lg" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight hidden sm:block bg-gradient-to-r from-white via-zinc-300 to-[#00E5FF] bg-clip-text text-transparent">
              CloudScale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-zinc-400 transition-all duration-200 hover:text-white rounded-lg hover:bg-white/[0.03] before:absolute before:bottom-0 before:left-1/2 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-[#00E5FF] before:to-[#8B5CF6] before:-translate-x-1/2 before:transition-all before:duration-300 hover:before:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-px h-6 bg-white/[0.08] mx-2" />
            <Link
              href="/auth/signin"
              className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/[0.03]"
            >
              Sign In
            </Link>
            <motion.a
              href="/auth/signin"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group flex items-center gap-2",
                "rounded-xl bg-gradient-to-b from-[#00E5FF] to-[#2563FF]",
                "hover:from-[#00B8D4] hover:to-[#1E40AF]",
                "px-5 py-2.5 text-sm font-semibold text-white",
                "shadow-[0_0_24px_-6px_rgba(0,229,255,0.4)]",
                "transition-all duration-200"
              )}
            >
              Launch CloudScale
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-zinc-300 hover:text-white p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#050505]/95 p-4 backdrop-blur-xl">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 text-sm text-zinc-300 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-3 border-t border-white/[0.08] pt-3 space-y-3">
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="block text-center py-3 text-zinc-300 hover:text-white transition-colors rounded-xl hover:bg-white/[0.03]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-gradient-to-b from-[#00E5FF] to-[#2563FF] py-3 text-center text-sm font-semibold text-white"
                  >
                    Launch CloudScale
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