import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { colors } from '../../theme/constants';

export const AnimatedGradientBlob = React.memo(function AnimatedGradientBlob({
  className,
  color = 'rgba(99, 102, 241, 0.12)',
  size = '350px',
  duration = 25,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      className={cn(
        "absolute pointer-events-none -z-10 rounded-full blur-[90px] opacity-45 select-none will-change-transform",
        className
      )}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        x: [0, 50, -30, 40, 0],
        y: [0, -60, 30, -40, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    />
  );
});

export const GlowBackground = React.memo(function GlowBackground({ 
  className, 
  color = colors.primaryGlow, 
  size = '800px', 
  ...props 
}) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none -z-10 rounded-full blur-[100px] opacity-50 select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, rgba(3, 7, 18, 0) 70%)`,
      }}
      {...props}
    />
  );
});

export const NoiseOverlay = React.memo(function NoiseOverlay({ className, opacity = 'opacity-[0.015]', ...props }) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none -z-20 select-none mix-blend-overlay w-full h-full",
        opacity,
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
      {...props}
    />
  );
});

export const GridBackground = React.memo(function GridBackground({ className, size = 44, opacity = 'opacity-[0.03]', ...props }) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none -z-20 w-full h-full",
        opacity,
        className
      )}
      style={{
        backgroundSize: `${size}px ${size}px`,
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
        `,
      }}
      {...props}
    />
  );
});

export const RadialGradient = React.memo(function RadialGradient({ className, from = 'transparent', to = '#030712', stop = '80%', ...props }) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none -z-10 w-full h-full select-none",
        className
      )}
      style={{
        background: `radial-gradient(circle at 50% 50%, ${from} 0%, ${to} ${stop})`,
      }}
      {...props}
    />
  );
});
