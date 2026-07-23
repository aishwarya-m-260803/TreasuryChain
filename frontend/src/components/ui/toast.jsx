import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast glass-panel text-foreground border-white/10 shadow-glass-lg rounded-lg p-4 flex gap-3 w-[356px] select-none",
          description: "text-muted-foreground text-xs font-medium",
          actionButton: "bg-primary text-primary-foreground text-xs font-bold rounded-md px-3 py-1.5 hover:bg-primary/90 transition-colors cursor-pointer",
          cancelButton: "bg-secondary text-secondary-foreground text-xs font-bold rounded-md px-3 py-1.5 hover:bg-secondary/90 transition-colors cursor-pointer",
          title: "text-xs font-bold text-white uppercase tracking-wider",
          success: "border-success/25 bg-success/5 text-success",
          error: "border-destructive/25 bg-destructive/5 text-destructive",
          info: "border-primary/25 bg-primary/5 text-primary",
          warning: "border-warning/25 bg-warning/5 text-warning"
        },
      }}
    />
  );
}
