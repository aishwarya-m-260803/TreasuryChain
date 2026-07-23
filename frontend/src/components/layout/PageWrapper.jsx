import React from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { transitions } from '../../theme/motion';

export const PageWrapper = React.memo(function PageWrapper({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : transitions.duration.normal, 
        ease: transitions.ease 
      }}
      className={cn("w-full flex flex-col flex-1 min-h-screen", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});
