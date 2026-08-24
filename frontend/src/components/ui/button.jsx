import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-[#C1121F] text-[#F5F5F5] hover:bg-[#E5383B] shadow-glow-primary border border-[#E5383B]/40 active:bg-[#A00E1A]',
    secondary: 'bg-[#171717] text-[#F5F5F5] hover:bg-[#1F1F1F] border border-[#2A2A2A]',
    glass: 'bg-[#171717] text-[#F5F5F5] border border-[#2A2A2A] hover:bg-[#1F1F1F] hover:border-[#E5383B]/50 hover:shadow-glow-primary',
    outline: 'border border-[#2A2A2A] bg-transparent text-[#F5F5F5] hover:bg-[#171717] hover:border-[#2A2A2A]',
    ghost: 'text-[#F5F5F5] hover:bg-[#171717]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={!disabled && !isLoading ? { scale: 1.012 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.985 } : {}}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
