import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-xs font-semibold text-[#A8A8A8] uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-10 px-3.5 rounded-lg bg-[#171717] border border-[#2A2A2A] text-sm text-[#F5F5F5] placeholder:text-[#A8A8A8]/60 focus:outline-none focus:ring-2 focus:ring-[#C1121F]/50 focus:border-[#C1121F] transition-all shadow-glass-sm",
          error && "border-[#C1121F] focus:ring-[#C1121F]/50 focus:border-[#C1121F]",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#C1121F] font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
