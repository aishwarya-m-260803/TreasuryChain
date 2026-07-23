import React from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { transitions } from '../../theme/motion';

export const AnimatedSection = React.memo(function AnimatedSection({ className, children, delay = 0, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : transitions.duration.normal, 
        delay, 
        ease: transitions.ease 
      }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});
