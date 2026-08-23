"use client";

import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { motion } from "framer-motion";

export interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  onMenuClick?: () => void;
}

export function DashboardLayout({
  children,
  title,
  description,
  headerClassName,
  sidebarClassName,
  onMenuClick,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Animated Grid Background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30"
        style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)" }}
      />
      <DashboardSidebar className={sidebarClassName} />
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <DashboardHeader
          title={title}
          description={description}
          className={headerClassName}
          onMenuClick={onMenuClick}
        />
        <main className="flex-1 pt-0 pb-6">
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayoutWithoutSidebar({
  children,
  title,
  description,
  headerClassName,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  headerClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-[#050505]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30"
        style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)" }}
      />
      <DashboardHeader title={title} description={description} className={headerClassName} />
      <main className="flex-1 p-4 md:p-5 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}