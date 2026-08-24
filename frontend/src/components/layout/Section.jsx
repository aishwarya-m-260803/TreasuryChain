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
    slate: 'bg-[#171717]/30',
    dark: 'bg-[#0D0D0D]',
    glow: 'bg-[#171717]/50 shadow-glow-primary/10',
  };

  return (
    <section
      className={cn(
        spacing.section.spacingY,
        "relative overflow-hidden w-full",
        backgrounds[variant] || backgrounds.transparent,
        borderTop && "border-t border-[#2A2A2A]",
        borderBottom && "border-b border-[#2A2A2A]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
});
