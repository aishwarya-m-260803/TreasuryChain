import React from 'react';
import { cn } from '../../utils/cn';

export const Divider = React.memo(function Divider({ className }) {
  return (
    <div className={cn("w-full h-px bg-white/5", className)} />
  );
});

export const GradientDivider = React.memo(function GradientDivider({ className }) {
  return (
    <div className={cn("w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent", className)} />
  );
});

export const SectionSpacer = React.memo(function SectionSpacer({ className, size = 'md' }) {
  const heights = {
    sm: 'h-8 md:h-12',
    md: 'h-16 md:h-24',
    lg: 'h-24 md:h-36',
  };
  return (
    <div className={cn("w-full shrink-0", heights[size] || heights.md, className)} />
  );
});

export const AnimatedDot = React.memo(function AnimatedDot({ className, color = 'bg-primary' }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)} />
      <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", color)} />
    </span>
  );
});

export const StatusIndicator = React.memo(function StatusIndicator({ className, status = 'success', label }) {
  const colors = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-primary',
  };

  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <AnimatedDot color={colors[status]} />
      {label && (
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
});
