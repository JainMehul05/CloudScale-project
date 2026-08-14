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

          {/* Base cloud shape - the foundation */}
          <path
            d="M14 38 C14 28.7 21.7 20 32 20 C38.6 20 44.3 23.2 48.5 28.5 C52.7 23.8 59 20.5 65.5 20.5 C72.1 20.5 77.8 24.7 80.5 31 C83.2 25.3 88.5 22 94 22 C100.6 22 106 27.4 106 34 C106 40.6 100.6 46 94 46 C87.4 46 82.1 41.3 79.5 35.5 C76.5 42.5 70.8 47 62.5 47 C54.2 47 47.5 42.3 43.3 36.5 C39.5 41.3 34.8 46 29 46 C22.4 46 17 40.6 17 34 C17 28.7 21.7 24 28.3 24 C32.5 24 36.3 26.2 38.8 29.5 C40.2 24.8 43.8 21.5 48.5 21.5 C55.1 21.5 60.5 26.9 60.5 33.5 C60.5 40.1 55.1 45.5 48.5 45.5 C41.9 45.5 36.5 40.1 36.5 33.5 C36.5 29.2 38.7 25.8 42 25.8 C44.5 25.8 46.5 27.8 47.5 30.5 C48.5 33.2 48.5 36 47.5 38.5 C46.5 41.2 44.5 43.2 42 43.2 C38.7 43.2 36.5 41 36.5 37.2 C36.5 34.8 37.8 32.5 40.2 32.5 C42.5 32.5 44.5 34 45 36 C45.5 38 45.5 40.2 44.5 42 C43.5 43.8 41.8 45.2 39.5 45.2 C37.2 45.2 35.2 43.8 34.2 42 C33.2 43.8 31.5 45.2 29.2 45.2 C26.9 45.2 24.9 43.8 23.9 42 C22.9 43.8 21.2 45.2 18.9 45.2 C16.6 45.2 14.6 43.8 13.6 42 C12.6 43.8 10.9 45.2 8.6 45.2 C6.3 45.2 4.3 43.8 3.3 42 C2.3 43.8 0.6 45.2 -1.7 45.2 -4 45.2 -6 -43.8 -7 -42 -8 -43.8 -9.7 -45.2 -12 -45.2 -14.3 -45.2 -16.3 -43.8 -17.3 -42 -18.3 -43.8 -19.3 -45.2 -21.6 -45.2 -23.9 -45.2 -25.9 -43.8 -26.9 -42 -27.9 -43.8 -28.9 -45.2 -31.2 -45.2 -33.5 -45.2 -35.5 -43.8 -36.5 -42 -37.5 -43.8 -38.5 -45.2 -40.8 -45.2 -43.1 -45.2 -45.1 -43.8 -46.1 -42 -47.1 -43.8 -48.1 -45.2 -50.4 -45.2 -52.7 -45.2 -54.7 -43.8 -55.7 -42 -56.7 -43.8 -57.7 -45.2 -60 -45.2"
            fill="url(#brandGradient)"
            opacity="0.95"
            transform="scale(0.35) translate(15, 20)"
          />

          {/* Three upward scaling layers - representing deployment stages */}
          <g fill="url(#accentGradient)" opacity="0.9">
            {/* Layer 1 - Foundation */}
            <rect x="18" y="36" width="28" height="3" rx="1.5" />
            {/* Layer 2 - Build */}
            <rect x="20" y="30" width="24" height="3" rx="1.5" />
            {/* Layer 3 - Deploy */}
            <rect x="22" y="24" width="20" height="3" rx="1.5" />
            {/* Layer 4 - Scale */}
            <rect x="24" y="18" width="16" height="3" rx="1.5" />
            {/* Layer 5 - Peak */}
            <rect x="26" y="12" width="12" height="3" rx="1.5" />
          </g>

          {/* Subtle "C" formed by negative space in the cloud curve */}
          <path
            d="M32 10 C24.5 10 18 16.5 18 24 C18 28.5 21.5 32.5 26 35 C30.5 37.5 36 38 41 36.5 C44.5 35.5 47.5 33 49 29.5 C50.5 26 50 21.5 48 18.5 C46 15.5 42.5 13.5 38.5 13.5 C34.5 13.5 30.8 15.5 28.5 18.5 C26.2 21.5 25.5 26 27 29.5"
            stroke="url(#accentGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.4"
            transform="scale(0.5) translate(12, 4)"
          />

          {/* Upward arrow indicator - scaling motion */}
          <g transform="translate(32, 40)">
            <path
              d="M0 -6 L-4 0 L4 0 Z"
              fill="url(#accentGradient)"
              opacity="0.7"
            />
            <path
              d="M0 -2 L-3 2 L3 2 Z"
              fill="url(#accentGradient)"
              opacity="0.5"
            />
          </g>
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