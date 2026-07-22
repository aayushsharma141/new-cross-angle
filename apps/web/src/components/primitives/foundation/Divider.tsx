// Genome ID: P006 Divider
import React from 'react';
import { cn } from '../../../lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'subtle' | 'default' | 'strong';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', variant = 'default', ...props }, ref) => {
    const variantClasses = {
      subtle: 'border-border/50',
      default: 'border-border',
      strong: 'border-foreground/20',
    };

    return (
      <hr
        ref={ref}
        className={cn(
          'shrink-0',
          orientation === 'horizontal' ? 'w-full border-t' : 'h-full border-l',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Divider.displayName = 'Divider';
