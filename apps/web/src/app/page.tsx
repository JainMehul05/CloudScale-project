"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Hero,
  ProductVisualization,
  Features,
  HowItWorks,
  Architecture,
  DeveloperExperience,
  CTA,
  Footer,
} from "@/components/landing";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505]">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3C/svg%3E\")",
        }}
      />
      <Navbar />
      <Hero />
      <ProductVisualization />
      <Features />
      <HowItWorks />
      <Architecture />
      <DeveloperExperience />
      <CTA />
      <Footer />
    </main>
  );
}