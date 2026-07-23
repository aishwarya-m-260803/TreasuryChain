import React from 'react';
import { cn } from '../../utils/cn';

export function FlexLayout({
  className,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap = 4,
  children,
  ...props
}) {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const alignments = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const justifications = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const wraps = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const gapStyles = {
    0: 'gap-0',
    1: 'gap-1',
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
        "flex",
        directions[direction] || 'flex-row',
        alignments[align] || 'items-stretch',
        justifications[justify] || 'justify-start',
        wraps[wrap] || 'flex-nowrap',
        gapStyles[gap] || 'gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
