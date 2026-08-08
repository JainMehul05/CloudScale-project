"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Rocket, Menu, X, ArrowRight } from "lucide-react";

const GITHUB_URL = "YOUR_GITHUB_URL_PLACEHOLDER";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Documentation", href: "#" },
  { label: "GitHub", href: GITHUB_URL, external: true },
];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-blue-500 via-cyan-300 to-violet-500"
    />
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <ScrollProgress />

      <header className="sticky top-0 z-50 px-4">
        <div
          className={`mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-xl transition-colors duration-300 ${
            scrolled
              ? "border-white/10 bg-black/70 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.9)]"
              : "border-white/5 bg-black/30"
          }`}
        >
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
              <Rocket className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              CloudScale
            </span>
          </a>


          {/* Desktop links */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={
                  link.external
                    ? "noopener noreferrer"
                    : undefined
                }
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>


          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#"
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              Login
            </a>

            <a
              href="#"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Get Started

              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
          </div>


          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-zinc-300 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>


        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -8,
                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="mx-auto max-w-7xl overflow-hidden md:hidden"
            >
              <div className="mt-2 flex flex-col gap-1 rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl">

                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={
                      link.external
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      link.external
                        ? "noopener noreferrer"
                        : undefined
                    }
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}


                <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">

                  <a
                    href="#"
                    className="rounded-md px-3 py-2 text-center text-sm text-zinc-300 hover:bg-white/5"
                  >
                    Login
                  </a>

                  <a
                    href="#"
                    className="rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black"
                  >
                    Get Started
                  </a>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>
    </>
  );
}