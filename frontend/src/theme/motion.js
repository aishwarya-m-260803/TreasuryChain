/**
 * Centralized Framer Motion configurations for TreasuryChain.
 * Reusable spring presets, hover dynamics, tap triggers, and staggers to maintain consistency.
 */

export const transitions = {
  // Easing presets
  ease: [0.16, 1, 0.3, 1], // Custom dynamic curve (similar to Apple/Linear)
  easeInOut: "easeInOut",
  easeOut: "easeOut",
  
  // Timing variables (avoiding magic numbers)
  duration: {
    fast: 0.2,
    normal: 0.35,
    slow: 0.6,
    xl: 1.2,
  },
  
  delay: {
    xs: 0.05,
    sm: 0.1,
    md: 0.2,
    lg: 0.4,
  }
};

export const springs = {
  // Spring dynamics configuration maps
  default: { type: "spring", stiffness: 180, damping: 20 },
  bouncy: { type: "spring", stiffness: 260, damping: 15, mass: 0.8 },
  stiff: { type: "spring", stiffness: 300, damping: 28, mass: 0.5 },
  smooth: { type: "spring", stiffness: 120, damping: 14, mass: 0.4 },
};

export const interactions = {
  // Tap configurations
  tap: {
    default: { scale: 0.985 },
    heavy: { scale: 0.95 },
    subtle: { scale: 0.995 },
  },
  // Hover configurations
  hover: {
    default: { scale: 1.015, y: -2 },
    lift: { y: -4 },
    subtle: { scale: 1.005 },
    glow: { boxShadow: "0 0 20px 0 rgba(99, 102, 241, 0.15)" },
  }
};

export const variants = {
  // Stagger wrapper configurations
  stagger: (staggerChildren = 0.08, delayChildren = 0) => ({
    animate: {
      transition: {
        staggerChildren,
        delayChildren,
      }
    }
  })
};
