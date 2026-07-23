import React from 'react';
import { cn } from '../../utils/cn';

export function GridLayout({
  className,
  cols = 3,
  colsSm = 1,
  colsMd = 2,
  colsLg = 3,
  gap = 6,
  children,
  ...props
}) {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    8: 'grid-cols-8',
    12: 'grid-cols-12',
  };

  const colSmStyles = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  const colMdStyles = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const colLgStyles = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  const gapStyles = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    12: 'gap-12',
  };

  return (
    <div
      className={cn(
        "grid w-full",
        colStyles[cols] || 'grid-cols-1',
        colSmStyles[colsSm],
        colMdStyles[colsMd],
        colLgStyles[colsLg],
        gapStyles[gap] || 'gap-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
