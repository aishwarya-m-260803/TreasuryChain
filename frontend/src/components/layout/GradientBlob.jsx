import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function GradientBlob({
  className,
  color = 'rgba(99, 102, 241, 0.12)',
  size = '300px',
  duration = 25,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      className={cn(
        "absolute pointer-events-none -z-10 rounded-full blur-[80px] opacity-50 select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        x: [0, 60, -40, 30, 0],
        y: [0, -70, 40, -30, 0],
        scale: [1, 1.12, 0.92, 1.08, 1],
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
}
