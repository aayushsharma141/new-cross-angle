// Genome ID: P002 Stack
import React from 'react';
import { cn } from '../../../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, as: Component = 'div', gap = 'md', align = 'stretch', justify = 'start', ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
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
        className={cn('flex flex-col', gapClasses[gap], alignClasses[align], justifyClasses[justify], className)}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';
