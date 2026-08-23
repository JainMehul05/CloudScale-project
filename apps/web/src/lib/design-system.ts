export const colors = {
  background: {
    primary: "#050505",
    secondary: "#080808",
    tertiary: "#0D0D12",
    elevated: "#12121A",
    card: "#0D0D12",
  },
  border: {
    subtle: "rgba(255,255,255,0.04)",
    default: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.15)",
    focus: "#00E5FF",
    accent: "rgba(0,229,255,0.3)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    muted: "#71717A",
    inverse: "#030303",
    link: "#00E5FF",
    accent: "#00E5FF",
  },
  accent: {
    primary: {
      400: "#00E5FF",
      500: "#00B8D4",
      600: "#0097A7",
    },
    secondary: {
      400: "#2563FF",
      500: "#1E40AF",
      600: "#1E3A8A",
    },
    purple: {
      400: "#A78BFA",
      500: "#8B5CF6",
      600: "#7C3AED",
    },
    success: {
      400: "#00FF9C",
      500: "#00CC7D",
      600: "#00995E",
    },
    danger: {
      400: "#FF3366",
      500: "#E62955",
      600: "#CC2144",
    },
  },
  gradients: {
    primary: "linear-gradient(135deg, #00E5FF 0%, #2563FF 50%, #8B5CF6 100%)",
    primaryHover: "linear-gradient(135deg, #00B8D4 0%, #1E40AF 50%, #7C3AED 100%)",
    subtle: "linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(37,99,255,0.04) 100%)",
    card: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
    glow: "radial-gradient(ellipse at center, rgba(0,229,255,0.12) 0%, transparent 70%)",
    glowStrong: "radial-gradient(ellipse at center, rgba(0,229,255,0.2) 0%, transparent 60%)",
    mesh: "linear-gradient(135deg, rgba(0,229,255,0.06) 0%, rgba(37,99,255,0.03) 50%, rgba(139,92,246,0.02) 100%)",
    cyan: "linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)",
    purple: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.4)",
    md: "0 4px 8px -2px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.3)",
    lg: "0 12px 16px -4px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.4)",
    xl: "0 24px 32px -8px rgba(0,0,0,0.6), 0 8px 12px -6px rgba(0,0,0,0.5)",
    glow: "0 0 24px -6px rgba(0,229,255,0.35)",
    glowStrong: "0 0 48px -12px rgba(0,229,255,0.45)",
    inner: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
    card: "0 0 0 1px rgba(255,255,255,0.04), 0 12px 16px -4px rgba(0,0,0,0.5)",
    cardHover: "0 0 0 1px rgba(0,229,255,0.3), 0 20px 40px -12px rgba(0,229,255,0.2)",
  },
  status: {
    deployed: {
      bg: "rgba(0,255,156,0.12)",
      text: "#00FF9C",
      border: "rgba(0,255,156,0.25)",
      dot: "#00FF9C",
    },
    building: {
      bg: "rgba(255,207,50,0.12)",
      text: "#FFCF32",
      border: "rgba(255,207,50,0.25)",
      dot: "#FFCF32",
    },
    pending: {
      bg: "rgba(0,229,255,0.12)",
      text: "#00E5FF",
      border: "rgba(0,229,255,0.25)",
      dot: "#00E5FF",
    },
    failed: {
      bg: "rgba(255,51,102,0.12)",
      text: "#FF3366",
      border: "rgba(255,51,102,0.25)",
      dot: "#FF3366",
    },
    stopped: {
      bg: "rgba(107,114,128,0.12)",
      text: "#9CA3AF",
      border: "rgba(107,114,128,0.25)",
      dot: "#9CA3AF",
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
    base: "bg-[#0D0D12] border border-white/[0.08] rounded-2xl backdrop-blur-sm",
    hover: "hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200",
    elevated: "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_16px_-4px_rgba(0,0,0,0.5)]",
    interactive: "bg-[#0D0D12] border border-white/[0.08] rounded-2xl backdrop-blur-sm hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200 cursor-pointer",
    glass: "bg-white/[0.02] border border-white/[0.08] rounded-2xl backdrop-blur-xl",
    glassHover: "hover:border-white/[0.2] hover:bg-white/[0.04] hover:shadow-[0_0_24px_-6px_rgba(0,229,255,0.2)] transition-all duration-300",
  },
  button: {
    primary: `
      inline-flex items-center justify-center gap-2
      bg-gradient-to-b from-[#00E5FF] to-[#2563FF]
      hover:from-[#00B8D4] hover:to-[#1E40AF]
      text-white px-5 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      shadow-[0_0_24px_-6px_rgba(0,229,255,0.4)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]
    `,
    secondary: `
      inline-flex items-center justify-center gap-2
      bg-white/[0.02] border border-white/[0.08]
      hover:bg-white/[0.05] hover:border-white/[0.15]
      text-zinc-100 px-5 py-2.5 rounded-xl
      text-sm font-medium
      transition-all duration-200
      backdrop-blur-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]
    `,
    ghost: `
      inline-flex items-center justify-center gap-2
      text-zinc-400 hover:text-white
      px-4 py-2 rounded-lg
      text-sm font-medium
      transition-colors duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]
    `,
    danger: `
      inline-flex items-center justify-center gap-2
      bg-[#FF3366]/15 border border-[#FF3366]/25
      hover:bg-[#FF3366]/25 hover:border-[#FF3366]/40
      text-[#FF3366] hover:text-[#FF6688]
      px-5 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3366]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]
    `,
    icon: `
      inline-flex items-center justify-center
      bg-white/[0.02] border border-white/[0.08]
      hover:bg-white/[0.05] hover:border-white/[0.15]
      text-zinc-400 hover:text-white
      p-2 rounded-xl
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]
    `,
    glass: `
      inline-flex items-center justify-center gap-2
      bg-white/[0.03] border border-white/[0.1]
      hover:bg-white/[0.06] hover:border-white/[0.2]
      text-zinc-100 px-5 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      backdrop-blur-xl
      shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
    `,
  },
  input: {
    base: `
      w-full bg-[#080808] border border-white/[0.08]
      rounded-xl px-4 py-3 text-sm text-white
      placeholder-zinc-600
      focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF]/50
      transition-all duration-200
      backdrop-blur-sm
    `,
    error: "border-[#FF3366]/50 focus:ring-[#FF3366]/50 focus:border-[#FF3366]",
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