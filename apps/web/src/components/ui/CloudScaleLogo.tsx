"use client";

import React from "react";

interface CloudScaleLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "monochrome" | "inverse";
  className?: string;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-12 h-12",
};

const textSizeMap = {
  sm: "text-sm",
  md: "text-base font-semibold",
  lg: "text-lg font-bold",
  xl: "text-xl font-bold",
};

export function CloudScaleLogo({
  size = "md",
  variant = "default",
  className = "",
  showText = false,
  textSize = "md",
}: CloudScaleLogoProps) {
  const iconColor =
    variant === "monochrome"
      ? "text-white"
      : variant === "inverse"
      ? "text-black"
      : "text-white";

  const bgGradient =
    variant === "monochrome"
      ? "bg-white"
      : variant === "inverse"
      ? "bg-gradient-to-br from-zinc-900 to-zinc-700"
      : "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500";

  const containerClass = `flex items-center gap-2 ${className}`.trim();

  return (
    <div className={containerClass}>
      <div
        className={`
          flex items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]
          ${sizeMap[size]} ${bgGradient}
        `}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="brandGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="30%" stopColor="#2563eb" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>

          {/* CloudScale Brand Mark - Abstract infrastructure symbol */}
          {/* Represents: Cloud foundation, deployment layers, scaling, container orchestration */}
          
          {/* Base foundation - the cloud/infrastructure layer */}
          <path
            d="M16 36 C16 28 22 22 32 22 C42 22 48 28 48 36 C48 40 44 43 38 45 C40 42 36 41 32 41 C28 41 24 42 20 44 C14 43 10 40 10 36 C10 30 16 25 24 25 C28 25 32 27 32 30 C32 33 28 35 24 35 C20 35 16 32 16 30 C16 28 18 26 22 26 C26 26 30 28 30 32 C30 36 26 38 22 38 C18 38 14 36 14 34 C14 32 16 30 20 30 C24 30 28 32 28 35"
            fill="url(#brandGradient)"
            opacity="0.95"
            transform="scale(0.8) translate(4, 4)"
          />

          {/* Deployment/Scaling layers - 5 ascending layers representing: Foundation → Build → Deploy → Scale → Peak */}
          <g fill="url(#accentGradient)" opacity="0.95">
            {/* Layer 1: Foundation (base infrastructure) */}
            <rect x="18" y="38" width="28" height="2.5" rx="1.25" />
            {/* Layer 2: Build (container image creation) */}
            <rect x="20" y="33" width="24" height="2.5" rx="1.25" />
            {/* Layer 3: Deploy (container orchestration) */}
            <rect x="22" y="28" width="20" height="2.5" rx="1.25" />
            {/* Layer 4: Scale (horizontal scaling) */}
            <rect x="24" y="23" width="16" height="2.5" rx="1.25" />
            {/* Layer 5: Peak (production traffic) */}
            <rect x="26" y="18" width="12" height="2.5" rx="1.25" />
          </g>

          {/* Container representation - rounded square with corner indicators */}
          <g stroke="url(#accentGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
            {/* Container outline */}
            <rect x="20" y="20" width="24" height="20" rx="3" />
            {/* Corner deployment indicators */}
            <path d="M23 23 L23 26 M23 23 L26 23" />
            <path d="M41 23 L38 23 M41 23 L41 26" />
            <path d="M23 37 L23 34 M23 37 L26 37" />
            <path d="M41 37 L38 37 M41 37 L41 34" />
          </g>

          {/* Upward trajectory arrow - representing scaling and growth */}
          <g transform="translate(32, 46)" fill="url(#accentGradient)" opacity="0.8">
            <path d="M0 -4 L-3 0 L3 0 Z" />
            <path d="M0 -1 L-2 2 L2 2 Z" opacity="0.6" />
          </g>

          {/* Subtle "C" monogram in negative space - formed by the cloud curve */}
          <path
            d="M32 14 C26 14 21 19 21 25 C21 29 24 32 28 34 C32 36 37 36 41 34 C45 32 48 29 48 25 C48 21 45 18 41 18 C37 18 32 20 28 23"
            stroke="url(#accentGradient)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.25"
            transform="scale(0.6) translate(11, 2)"
          />
        </svg>
      </div>

      {showText && (
        <span className={`${textSizeMap[textSize]} tracking-tight ${iconColor}`}>
          CloudScale
        </span>
      )}
    </div>
  );
}

export function CloudScaleMark({
  size = "md",
  variant = "default",
  className = "",
}: Omit<CloudScaleLogoProps, "showText" | "textSize">) {
  return <CloudScaleLogo size={size} variant={variant} className={className} showText={false} />;
}