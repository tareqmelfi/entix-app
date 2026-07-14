/**
 * ENSIDEX Design System — Design Tokens
 * Single source of truth for colors, spacing, radius, shadows, typography.
 * Consumed by tailwind.config.ts and globals.css (CSS variables).
 */

export const colors = {
  // Brand
  violet: "#7c3aed",
  violetHover: "#6d28d9",
  violetSoft: "#f3e8ff",

  // Surface — dark-first management platform
  ink: "#142033",
  navy: "#061936",
  navyLight: "#0f2540",
  navyBorder: "rgba(255,255,255,0.08)",

  // Status
  mint: "#11b981",
  mintSoft: "#d1fae5",
  amber: "#f59e0b",
  amberSoft: "#fef3c7",
  danger: "#ef4444",
  dangerSoft: "#fee2e2",

  // Neutrals
  canvas: "#f5f7fb",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  line: "#e2e8f0",
  lineDark: "#1e293b",
  muted: "#65758b",
  mutedDark: "#94a3b8",
  slate: "#475569"
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px"
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(15,23,42,0.06)",
  sm: "0 2px 8px rgba(15,23,42,0.06)",
  soft: "0 12px 32px rgba(15,23,42,0.08)",
  lg: "0 16px 48px rgba(15,23,42,0.12)"
} as const;

export const spacing = {
  page: "1.25rem",
  section: "1.5rem"
} as const;

export const fonts = {
  sans: '"IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
} as const;

export type StatusTone = "good" | "warning" | "danger" | "neutral";

export const statusToneMap: Record<StatusTone, { text: string; bg: string; border: string }> = {
  good: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  warning: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  danger: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  neutral: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" }
};
