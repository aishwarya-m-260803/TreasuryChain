import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export const CursorGlow = React.memo(function CursorGlow({ 
  className, 
  size = 400, 
  color = 'rgba(99, 102, 241, 0.05)' 
}) {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = -size;
    let mouseY = -size;
    let currentX = -size;
    let currentY = -size;
    let rafId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX - size / 2;
      mouseY = e.clientY - size / 2;
    };

    const updatePosition = () => {
      // Direct high-performance lerp interpolation
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [size]);

  return (
    <div
      ref={glowRef}
      className={cn(
        "fixed pointer-events-none -z-10 rounded-full blur-[100px] select-none will-change-transform",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, rgba(3, 7, 18, 0) 70%)`,
        transform: `translate3d(${-size}px, ${-size}px, 0)`,
      }}
    />
  );
});
