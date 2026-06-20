import React from 'react';
import { textClasses } from '../tokens/typography';
import { effects } from '../tokens/elevation';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, type, ...props }, ref) => {

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    effects.focusRing,
                    error && "border-error focus-visible:ring-error",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, htmlFor, children, ...props }, ref) => (
        <label
            ref={ref}
            htmlFor={htmlFor}
            className={cn(textClasses.label, "peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
            {...props}
        >
            {children}
        </label>
    )
);
Label.displayName = "Label";

export const FormError = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    if (!children) return null;
    return (
        <p
            className={cn("text-[0.8rem] font-medium text-error mt-1", className)}
            aria-live="assertive"
        >
            {children}
        </p>
    );
};
