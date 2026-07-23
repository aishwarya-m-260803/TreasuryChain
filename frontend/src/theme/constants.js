/**
 * Centralized Theme Constants for TreasuryChain.
 * Declares design system colors, border-radiuses, shadows, opacities, and spacers.
 */

export const spacing = {
  container: {
    maxWidth: "max-w-7xl",
    padding: "px-4 sm:px-6 lg:px-8",
  },
  section: {
    spacingY: "py-12 md:py-20 lg:py-24",
  },
  stack: {
    sm: "space-y-3",
    md: "space-y-6",
    lg: "space-y-10",
  }
};

export const colors = {
  // Brand accent mappings
  primary: "#6366f1",
  primaryGlow: "rgba(99, 102, 241, 0.08)",
  accent: "#8b5cf6",
  accentGlow: "rgba(139, 92, 246, 0.05)",
  
  // State color mapping
  success: "#10b981",
  successGlow: "rgba(16, 185, 129, 0.08)",
  warning: "#f59e0b",
  warningGlow: "rgba(245, 158, 11, 0.08)",
  destructive: "#ef4444",
  destructiveGlow: "rgba(239, 68, 68, 0.08)",
};

export const borders = {
  radius: {
    sm: "rounded-sm", // radius - 4px
    md: "rounded-md", // radius - 2px
    lg: "rounded-xl", // radius (0.75rem / 12px)
    full: "rounded-full",
  },
  glassBorder: "border-white/5",
  glassBorderGlow: "border-primary/20",
};

export const shadows = {
  sm: "0 2px 8px 0 rgba(0, 0, 0, 0.3)",
  glass: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
  glowPrimary: "0 0 20px 0 rgba(99, 102, 241, 0.12)",
  glowSuccess: "0 0 20px 0 rgba(16, 185, 129, 0.12)",
};

export const opacities = {
  hover: "opacity-80",
  disabled: "opacity-50",
  subtle: "opacity-[0.015]",
  glassBg: "rgba(11, 15, 25, 0.6)",
};
