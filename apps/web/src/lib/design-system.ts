export const colors = {
  background: {
    primary: "#030303",
    secondary: "#0a0a0a",
    tertiary: "#111111",
    elevated: "#1a1a1a",
    card: "#0d0d0d",
  },
  border: {
    subtle: "rgba(255,255,255,0.04)",
    default: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.15)",
    focus: "#3b82f6",
    accent: "rgba(59,130,246,0.3)",
  },
  text: {
    primary: "#fafafa",
    secondary: "#a1a1aa",
    muted: "#71717a",
    inverse: "#030303",
    link: "#60a5fa",
    accent: "#22d3ee",
  },
  accent: {
    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    cyan: {
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
    },
    emerald: {
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
    },
    amber: {
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
    },
    red: {
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
    },
    violet: {
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
    },
  },
  gradients: {
    primary: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #22d3ee 100%)",
    primaryHover: "linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #06b6d4 100%)",
    subtle: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.04) 100%)",
    card: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
    glow: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
    glowStrong: "radial-gradient(ellipse at center, rgba(59,130,246,0.2) 0%, transparent 60%)",
    mesh: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.03) 50%, rgba(34,211,238,0.02) 100%)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.4)",
    md: "0 4px 8px -2px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.3)",
    lg: "0 12px 16px -4px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.4)",
    xl: "0 24px 32px -8px rgba(0,0,0,0.6), 0 8px 12px -6px rgba(0,0,0,0.5)",
    glow: "0 0 24px -6px rgba(59,130,246,0.35)",
    glowStrong: "0 0 48px -12px rgba(59,130,246,0.45)",
    inner: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
  },
  status: {
    deployed: {
      bg: "rgba(16,185,129,0.12)",
      text: "#34d399",
      border: "rgba(16,185,129,0.25)",
      dot: "#34d399",
    },
    building: {
      bg: "rgba(245,158,11,0.12)",
      text: "#fbbf24",
      border: "rgba(245,158,11,0.25)",
      dot: "#fbbf24",
    },
    pending: {
      bg: "rgba(59,130,246,0.12)",
      text: "#60a5fa",
      border: "rgba(59,130,246,0.25)",
      dot: "#60a5fa",
    },
    failed: {
      bg: "rgba(239,68,68,0.12)",
      text: "#f87171",
      border: "rgba(239,68,68,0.25)",
      dot: "#f87171",
    },
    stopped: {
      bg: "rgba(107,114,128,0.12)",
      text: "#9ca3af",
      border: "rgba(107,114,128,0.25)",
      dot: "#9ca3af",
    },
  },
};

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
};

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

export const typography = {
  fontFamilies: {
    sans: "var(--font-body), system-ui, sans-serif",
    display: "var(--font-display), system-ui, sans-serif",
    mono: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  fontWeights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeights: {
    tight: "1.1",
    normal: "1.5",
    relaxed: "1.625",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.04em",
    widest: "0.1em",
  },
};

export const transitions = {
  fast: "120ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
  spring: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
};

export const componentStyles = {
  card: {
    base: "bg-[#0d0d0d] border border-white/[0.08] rounded-2xl backdrop-blur-sm",
    hover: "hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200",
    elevated: "shadow-[0_12px_16px_-4px_rgba(0,0,0,0.5)]",
    interactive: "bg-[#0d0d0d] border border-white/[0.08] rounded-2xl backdrop-blur-sm hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200 cursor-pointer",
  },
  button: {
    primary: `
      inline-flex items-center justify-center gap-2
      bg-gradient-to-b from-blue-500 to-cyan-600
      hover:from-blue-400 hover:to-cyan-500
      text-white px-5 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      shadow-[0_0_24px_-6px_rgba(59,130,246,0.4)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]
    `,
    secondary: `
      inline-flex items-center justify-center gap-2
      bg-white/[0.02] border border-white/[0.08]
      hover:bg-white/[0.05] hover:border-white/[0.15]
      text-zinc-100 px-5 py-2.5 rounded-xl
      text-sm font-medium
      transition-all duration-200
      backdrop-blur-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]
    `,
    ghost: `
      inline-flex items-center justify-center gap-2
      text-zinc-400 hover:text-white
      px-4 py-2 rounded-lg
      text-sm font-medium
      transition-colors duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]
    `,
    danger: `
      inline-flex items-center justify-center gap-2
      bg-red-500/15 border border-red-500/25
      hover:bg-red-500/25 hover:border-red-500/40
      text-red-400 hover:text-red-300
      px-5 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]
    `,
    icon: `
      inline-flex items-center justify-center
      bg-white/[0.02] border border-white/[0.08]
      hover:bg-white/[0.05] hover:border-white/[0.15]
      text-zinc-400 hover:text-white
      p-2 rounded-xl
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]
    `,
  },
  input: {
    base: `
      w-full bg-[#030303] border border-white/[0.08]
      rounded-xl px-4 py-3 text-sm text-white
      placeholder-zinc-600
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
      transition-all duration-200
      backdrop-blur-sm
    `,
    error: "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
    disabled: "opacity-50 cursor-not-allowed",
  },
  badge: {
    base: `
      inline-flex items-center gap-1.5
      px-2.5 py-1 rounded-full text-[11px] font-medium border
    `,
    dot: "w-1.5 h-1.5 rounded-full",
  },
  modal: {
    overlay: `
      fixed inset-0 z-50 bg-black/70 backdrop-blur-sm
      animate-in fade-in duration-200
    `,
    content: `
      fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4
      animate-in zoom-in-95 fade-in duration-200
    `,
  },
  scrollbar: `
    &::-webkit-scrollbar { width: 8px; height: 8px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `,
};

export function getStatusStyles(status: keyof typeof colors.status) {
  return colors.status[status] || colors.status.pending;
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}