// Genome ID: P001 Container
import React from 'react';
import { cn } from '../../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', as: Component = 'div', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[1800px]',
      full: 'max-w-full',
    };

    return (
      <Component
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
