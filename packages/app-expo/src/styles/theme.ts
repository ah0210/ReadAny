/**
 * Theme constants — matching the Tauri mobile app's dark theme (globals.css)
 *
 * oklch dark values converted to hex:
 *   background: oklch(0.15 0 285.86) → #1c1c1e
 *   foreground: oklch(0.93 0 285.86) → #e8e8ed
 *   card:       oklch(0.20 0 285.86) → #2c2c2e
 *   muted:      oklch(0.22 0 285.86) → #333336
 *   muted-fg:   oklch(0.55 0.02 285.93) → #7c7c82
 *   border:     oklch(0.28 0 285.86) → #3d3d40
 *   primary:    oklch(0.90 0.01 285.93) → #e0e0e6
 *   primary-fg: oklch(0.15 0 285.86) → #1c1c1e
 *   destructive: oklch(0.58 0.24 28.48) → #e53935
 *   accent:     oklch(0.24 0 285.86) → #363638
 */
export const colors = {
  background: "#1c1c1e",
  foreground: "#e8e8ed",
  card: "#2c2c2e",
  cardForeground: "#e8e8ed",
  muted: "#333336",
  mutedForeground: "#7c7c82",
  border: "#3d3d40",
  primary: "#e0e0e6",
  primaryForeground: "#1c1c1e",
  destructive: "#e53935",
  destructiveForeground: "#ffffff",
  accent: "#363638",
  accentForeground: "#e0e0e6",

  // Functional
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  blue: "#3b82f6",

  // Highlight colors
  highlightYellow: "#854d0e",
  highlightGreen: "#166534",
  highlightBlue: "#1e40af",
  highlightPink: "#9d174d",
  highlightPurple: "#6b21a8",

  // Fallback cover gradients
  stone100: "#f5f5f4",
  stone200: "#e7e5e4",
  stone300: "#d6d3d1",
  stone400: "#a8a29e",
  stone500: "#78716c",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
} as const;

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
