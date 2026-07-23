import React from 'react';
import { cn } from '../../utils/cn';
import { spacing } from '../../theme/constants';

export const Section = React.memo(function Section({ 
  className, 
  children, 
  borderTop = false, 
  borderBottom = false, 
  variant = 'transparent',
  ...props 
}) {
  const backgrounds = {
    transparent: 'bg-transparent',
    slate: 'bg-slate-950/30',
    dark: 'bg-slate-950/60',
    glow: 'bg-slate-950/15 shadow-glow-primary/5',
  };

  return (
    <section
      className={cn(
        spacing.section.spacingY,
        "relative overflow-hidden w-full",
        backgrounds[variant] || backgrounds.transparent,
        borderTop && "border-t border-white/5",
        borderBottom && "border-b border-white/5",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
});
