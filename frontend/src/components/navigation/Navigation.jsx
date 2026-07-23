import React from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const NavGroup = React.memo(function NavGroup({ className, children, ...props }) {
  return (
    <nav
      className={cn(
        "flex items-center gap-2 border-b border-white/5 pb-px select-none",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
});

export const NavItem = React.memo(function NavItem({ className, active = false, children, ...props }) {
  return (
    <button
      className={cn(
        "relative py-2.5 px-3.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none select-none cursor-pointer",
        active ? "text-white" : "text-muted-foreground hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export const AnimatedUnderline = React.memo(function AnimatedUnderline({ className, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      layoutId="activeUnderline"
      className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-glow-primary", className)}
      transition={shouldReduceMotion ? { type: "just" } : { type: "spring", stiffness: 380, damping: 30 }}
      {...props}
    />
  );
});

export const ActiveIndicator = React.memo(function ActiveIndicator({ className, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      layoutId="activeIndicator"
      className={cn(
        "absolute inset-0 bg-white/[0.03] border border-white/5 rounded-lg -z-10",
        className
      )}
      transition={shouldReduceMotion ? { type: "just" } : { type: "spring", stiffness: 380, damping: 30 }}
      {...props}
    />
  );
});
