// Genome ID: P012 Select
import React from 'react';
import { cn } from '../../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, disabled, children, ...props }, ref) => {
    const baseClasses = 'flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    
    const validClasses = 'focus-visible:ring-primary';
    const invalidClasses = 'border-error focus-visible:ring-error text-error placeholder:text-error/70';

    return (
      <div className="relative w-full">
        <select
          className={cn(baseClasses, invalid ? invalidClasses : validClasses, className)}
          ref={ref}
          disabled={disabled}
          aria-invalid={!!invalid}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
