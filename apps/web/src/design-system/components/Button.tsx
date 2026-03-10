import React from 'react';
import { textClasses } from '../tokens/typography';
import { effects, radius } from '../tokens/elevation';
import { cn } from '../../lib/utils'; // Assuming clsx/tailwind-merge utility

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ' + effects.focusRing;

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
            outline: 'border border-input bg-transparent hover:bg-secondary hover:text-accent-foreground',
            ghost: 'hover:bg-secondary hover:text-accent-foreground',
            destructive: 'bg-error text-error-foreground hover:bg-error/90',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 py-2 px-4',
            lg: 'h-11 px-8 text-lg',
            icon: 'h-10 w-10',
        };

        // Convert inline styles to tailwind arbitrary values or keep mapped classes
        const radiusClass = 'rounded-md'; // Can be mapped to radius.md

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], radiusClass, className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
