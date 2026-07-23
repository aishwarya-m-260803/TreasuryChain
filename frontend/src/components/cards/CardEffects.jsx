import React, { useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const GlassCardHover = React.memo(function GlassCardHover({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      whileHover={shouldReduceMotion ? {} : { y: -4, borderColor: 'rgba(255, 255, 255, 0.15)', boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("glass-panel rounded-xl overflow-hidden text-foreground transition-all duration-300", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const GlowCard = React.memo(function GlowCard({ className, children, glowColor = 'rgba(99, 102, 241, 0.08)', ...props }) {
  return (
    <div
      className={cn("relative rounded-xl overflow-hidden border border-white/5 bg-slate-900/40 text-foreground", className)}
      style={{
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 0 30px 0 ${glowColor}`,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export const FloatingCard = React.memo(function FloatingCard({ className, children, duration = 6, yOffset = 8, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      animate={shouldReduceMotion ? {} : { y: [0, -yOffset, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={cn("glass-panel rounded-xl overflow-hidden text-foreground", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const InteractiveCard = React.memo(function InteractiveCard({ className, children, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("glass-panel rounded-xl overflow-hidden text-foreground cursor-pointer select-none", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const HoverBorder = React.memo(function HoverBorder({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.005 }}
      className={cn(
        "relative p-[1px] rounded-xl overflow-hidden bg-white/5 hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-primary transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="bg-slate-950/95 w-full h-full rounded-[11px] overflow-hidden">
        {children}
      </div>
    </m.div>
  );
});
