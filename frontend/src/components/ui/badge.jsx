import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none border transition-all duration-300';
  
  const variants = {
    default: 'bg-primary/10 border-primary/20 text-primary shadow-glow-primary/10',
    secondary: 'bg-secondary text-secondary-foreground border-border',
    success: 'bg-success/10 border-success/20 text-success shadow-glow-success/10',
    warning: 'bg-warning/10 border-warning/20 text-warning shadow-glow-warning/10',
    destructive: 'bg-destructive/10 border-destructive/20 text-destructive shadow-glow-destructive/10',
    outline: 'border border-border bg-transparent text-muted-foreground',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full shrink-0",
        variant === 'default' && "bg-primary animate-pulse",
        variant === 'secondary' && "bg-muted-foreground",
        variant === 'success' && "bg-success animate-pulse",
        variant === 'warning' && "bg-warning animate-pulse",
        variant === 'destructive' && "bg-destructive animate-pulse",
        variant === 'outline' && "bg-muted-foreground/40"
      )} />
      {children}
    </span>
  );
}
