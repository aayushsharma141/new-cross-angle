// Genome ID: P004 Grid
import React from 'react';
import { cn } from '../../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, as: Component = 'div', cols = 1, gap = 'md', ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
    };

    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };

    return (
      <Component
        ref={ref}
        className={cn('grid', colClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';
