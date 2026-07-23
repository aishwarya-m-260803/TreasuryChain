import React from 'react';
import { cn } from '../../utils/cn';
import { spacing } from '../../theme/constants';

export function Container({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        spacing.container.maxWidth, 
        spacing.container.padding, 
        "mx-auto w-full", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
