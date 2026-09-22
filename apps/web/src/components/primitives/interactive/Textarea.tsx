// Genome ID: P011 Textarea
import React from 'react';
import { cn } from '../../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, disabled, ...props }, ref) => {
    const baseClasses = 'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    
    const validClasses = 'focus-visible:ring-primary';
    const invalidClasses = 'border-error focus-visible:ring-error text-error placeholder:text-error/70';

    return (
      <textarea
        className={cn(baseClasses, invalid ? invalidClasses : validClasses, className)}
        ref={ref}
        disabled={disabled}
        aria-invalid={!!invalid}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
