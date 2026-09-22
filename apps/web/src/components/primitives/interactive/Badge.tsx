// Genome ID: P015 Badge
import React from 'react';
import { cn } from '../../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-primary border-transparent text-primary-foreground',
      secondary: 'bg-secondary border-transparent text-secondary-foreground',
      outline: 'border-border text-foreground bg-transparent',
      destructive: 'bg-error border-transparent text-error-foreground',
    };

    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
