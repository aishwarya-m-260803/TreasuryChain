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
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-10 px-3.5 rounded-lg bg-white/[0.03] backdrop-blur-md border border-white/5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-glass-sm",
          error && "border-destructive/50 focus:ring-destructive/50 focus:border-destructive/50",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-destructive font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
