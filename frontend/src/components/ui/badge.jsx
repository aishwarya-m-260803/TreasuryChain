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
    default: 'bg-[#C1121F]/15 border-[#C1121F]/30 text-[#F5F5F5] shadow-glow-primary',
    secondary: 'bg-[#1F1F1F] text-[#A8A8A8] border-[#2A2A2A]',
    success: 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]',
    warning: 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]',
    destructive: 'bg-[#C1121F]/20 border-[#C1121F]/40 text-[#E5383B]',
    outline: 'border border-[#2A2A2A] bg-transparent text-[#A8A8A8]',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full shrink-0",
        variant === 'default' && "bg-[#C1121F] animate-pulse",
        variant === 'secondary' && "bg-[#A8A8A8]",
        variant === 'success' && "bg-[#10B981] animate-pulse",
        variant === 'warning' && "bg-[#F59E0B] animate-pulse",
        variant === 'destructive' && "bg-[#E5383B] animate-pulse",
        variant === 'outline' && "bg-[#A8A8A8]/40"
      )} />
      {children}
    </span>
  );
}
