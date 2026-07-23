import React, { useEffect, useRef } from 'react';
import { m, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { transitions, springs, interactions } from '../../theme/motion';

export const FadeIn = React.memo(function FadeIn({ className, children, duration = transitions.duration.normal, delay = 0, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const SlideUp = React.memo(function SlideUp({ className, children, duration = transitions.duration.normal, delay = 0, yOffset = 15, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const SlideLeft = React.memo(function SlideLeft({ className, children, duration = transitions.duration.normal, delay = 0, xOffset = 20, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const SlideRight = React.memo(function SlideRight({ className, children, duration = transitions.duration.normal, delay = 0, xOffset = -20, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const ScaleIn = React.memo(function ScaleIn({ className, children, duration = transitions.duration.normal, delay = 0, scaleStart = 0.95, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: scaleStart }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const RevealOnScroll = React.memo(function RevealOnScroll({
  className,
  children,
  delay = 0,
  duration = transitions.duration.normal,
  yOffset = 20,
  once = true,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-8%' }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: transitions.ease }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const StaggerContainer = React.memo(function StaggerContainer({ className, children, staggerTime = 0.08, delayTime = 0, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerTime,
            delayChildren: delayTime,
          }
        }
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const AnimatedCounter = React.memo(function AnimatedCounter({ value, duration = transitions.duration.slow, delay = 0, className }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) {
        ref.current.textContent = value.toLocaleString();
      }
      return;
    }
    const controls = animate(count, value, {
      duration,
      delay,
      ease: transitions.ease,
    });
    return () => controls.stop();
  }, [count, value, duration, delay, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toLocaleString();
      }
    });
  }, [rounded, shouldReduceMotion]);

  return <span ref={ref} className={className}>0</span>;
});

export const HoverLift = React.memo(function HoverLift({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      whileHover={shouldReduceMotion ? {} : interactions.hover.lift}
      transition={springs.default}
      className={cn(className)}
      {...props}
    >
      {children}
    </m.div>
  );
});

export const HoverGlow = React.memo(function HoverGlow({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      whileHover={shouldReduceMotion ? {} : interactions.hover.glow}
      transition={springs.smooth}
      className={cn("transition-all duration-300 rounded-xl", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});
