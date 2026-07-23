import React from 'react';
import { cn } from '../../utils/cn';

export function Stack({
  className,
  spacing = 'md',
  align = 'stretch',
  children,
  ...props
}) {
  const spacings = {
    xs: 'gap-1.5',
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-10',
    xl: 'gap-16',
  };

  const alignments = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        spacings[spacing] || spacings.md,
        alignments[align] || alignments.stretch,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
