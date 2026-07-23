import React from 'react';
import { cn } from '../../utils/cn';

export function SectionHeading({
  className,
  tag,
  title,
  description,
  align = 'center',
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 mb-8 md:mb-12 max-w-3xl",
        align === 'center' && "items-center text-center mx-auto",
        align === 'left' && "items-start text-left",
        align === 'right' && "items-end text-right",
        className
      )}
      {...props}
    >
      {tag && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary select-none">
          {tag}
        </span>
      )}
      {title && (
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white m-0 leading-tight">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
