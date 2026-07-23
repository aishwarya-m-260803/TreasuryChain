import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(({
  className,
  children,
  animate = false,
  ...props
}, ref) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    whileHover: { y: -4, transition: { duration: 0.2 } }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-xl bg-slate-900/40 border border-white/5 text-foreground shadow-sm overflow-hidden",
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export const GlassCard = React.forwardRef(({
  className,
  children,
  animate = false,
  glow = false,
  ...props
}, ref) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    whileHover: { y: -4, scale: 1.005, transition: { duration: 0.2 } }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        glow ? "glass-panel-glow" : "glass-panel",
        "rounded-xl overflow-hidden text-foreground transition-all duration-300",
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});

GlassCard.displayName = 'GlassCard';

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("p-6 flex flex-col gap-1.5", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-lg font-bold tracking-tight text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0 flex items-center border-t border-white/5 mt-4", className)} {...props}>
    {children}
  </div>
);
