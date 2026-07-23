import React from 'react';
import { cn } from '../../utils/cn';

export const HeroTitle = React.memo(function HeroTitle({ className, children, ...props }) {
  return (
    <h1
      className={cn(
        "text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
});

export const PageTitle = React.memo(function PageTitle({ className, children, ...props }) {
  return (
    <h2
      className={cn(
        "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-sans",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
});

export const SectionTitle = React.memo(function SectionTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white font-sans",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

export const SectionSubtitle = React.memo(function SectionSubtitle({ className, children, ...props }) {
  return (
    <p
      className={cn(
        "text-sm sm:text-base text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

export const BodyText = React.memo(function BodyText({ className, children, ...props }) {
  return (
    <p
      className={cn(
        "text-sm text-foreground/80 leading-relaxed font-normal",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

export const MutedText = React.memo(function MutedText({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "text-xs text-muted-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

export const Caption = React.memo(function Caption({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
