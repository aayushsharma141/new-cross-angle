// Genome ID: P003 Cluster
import React from 'react';
import { cn } from '../../../lib/utils';

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(
  ({ className, as: Component = 'div', gap = 'md', align = 'center', justify = 'start', wrap = true, ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          wrap ? 'flex-wrap' : 'flex-nowrap',
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      />
    );
  }
);
Cluster.displayName = 'Cluster';
