// Genome ID: P005 Surface
import React from 'react';
import { cn } from '../../../lib/utils';

export type SurfaceProps<T extends React.ElementType = 'div'> = {
  as?: T;
  variant?: 'primary' | 'secondary' | 'muted' | 'transparent' | 'glass';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>;

type SurfaceComponent = (<T extends React.ElementType = 'div'>(
  props: SurfaceProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
) => React.ReactNode) & { displayName?: string };

export const Surface = React.forwardRef(
  <T extends React.ElementType = 'div'>(
    { className, as, variant = 'primary', radius = 'md', shadow = 'none', border = false, ...props }: SurfaceProps<T>,
    ref: React.ComponentPropsWithRef<T>['ref']
  ) => {
    const Component = as || 'div';
    const variantClasses = {
      primary: 'bg-background text-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      muted: 'bg-muted text-muted-foreground',
      transparent: 'bg-transparent',
      glass: 'bg-background/80 backdrop-blur-md',
    };

    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    const shadowClasses = {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          variantClasses[variant],
          radiusClasses[radius],
          shadowClasses[shadow],
          border && 'border border-border',
          className
        )}
        {...props}
      />
    );
  }
) as SurfaceComponent;
Surface.displayName = 'Surface';
