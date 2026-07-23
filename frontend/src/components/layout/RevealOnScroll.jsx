import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function RevealOnScroll({
  className,
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 20,
  once = true,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10%' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
