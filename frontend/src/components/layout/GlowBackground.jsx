import React from 'react';
import { cn } from '../../utils/cn';

export function GlowBackground({ className, color = 'rgba(99, 102, 241, 0.08)', size = '800px', ...props }) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none -z-10 rounded-full blur-[100px] opacity-60 select-none",
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
}
