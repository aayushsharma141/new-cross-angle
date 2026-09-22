// Genome ID: P009 Link
import React from 'react';
import { cn } from '../../../lib/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'muted' | 'destructive' | 'inherit';
  underline?: 'none' | 'hover' | 'always';
  as?: React.ElementType;
  to?: string | object;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant = 'primary', underline = 'hover', as: Component = 'a', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'text-primary hover:text-primary/80 focus-visible:ring-primary',
      muted: 'text-muted-foreground hover:text-foreground focus-visible:ring-foreground',
      destructive: 'text-error hover:text-error/80 focus-visible:ring-error',
      inherit: 'text-inherit focus-visible:ring-foreground',
    };

    const underlineClasses = {
      none: 'no-underline',
      hover: 'hover:underline underline-offset-4',
      always: 'underline underline-offset-4',
    };

    const baseClasses = 'inline-flex items-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    return (
      <Component
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], underlineClasses[underline], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Link.displayName = 'Link';
