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
  primary: "#C1121F",
  primaryGlow: "rgba(193, 18, 31, 0.15)",
  accent: "#E5383B",
  accentGlow: "rgba(229, 56, 59, 0.1)",
  background: "#0D0D0D",
  surface: "#171717",
  border: "#2A2A2A",
  text: "#F5F5F5",
  secondaryText: "#A8A8A8",
  
  // State color mapping
  success: "#10b981",
  successGlow: "rgba(16, 185, 129, 0.08)",
  warning: "#f59e0b",
  warningGlow: "rgba(245, 158, 11, 0.08)",
  destructive: "#C1121F",
  destructiveGlow: "rgba(193, 18, 31, 0.15)",
};

export const borders = {
  radius: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  },
  glassBorder: "border-[#2A2A2A]",
  glassBorderGlow: "border-[#C1121F]/30",
};

export const shadows = {
  sm: "0 2px 8px 0 rgba(0, 0, 0, 0.4)",
  glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
  glowPrimary: "0 0 20px 0 rgba(193, 18, 31, 0.2)",
  glowSuccess: "0 0 20px 0 rgba(16, 185, 129, 0.12)",
};

export const opacities = {
  hover: "opacity-90",
  disabled: "opacity-50",
  subtle: "opacity-[0.015]",
  glassBg: "#171717",
};
