// Genome ID: P013 Checkbox
import React from 'react';
import { cn } from '../../../lib/utils';
import { Cluster, Text } from '../foundation';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, invalid, disabled, label, ...props }, ref) => {
    const baseClasses = 'peer h-4 w-4 shrink-0 rounded-sm border border-input bg-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-primary accent-primary transition-colors';
    
    const validClasses = 'focus-visible:ring-primary';
    const invalidClasses = 'border-error focus-visible:ring-error accent-error';

    const input = (
      <input
        type="checkbox"
        className={cn(baseClasses, invalid ? invalidClasses : validClasses, className)}
        ref={ref}
        disabled={disabled}
        aria-invalid={!!invalid}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <Cluster gap="sm" align="center">
        {input}
        <Text variant="body" className={cn("text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", invalid && "text-error")}>
          {label}
        </Text>
      </Cluster>
    );
  }
);
Checkbox.displayName = 'Checkbox';
