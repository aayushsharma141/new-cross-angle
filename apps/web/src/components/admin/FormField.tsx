import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldProps {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const FormField = ({
    label,
    error,
    hint,
    required,
    className,
    children,
}: FormFieldProps) => {
    return (
        <div className={cn("space-y-2", className)}>
            <Label className="flex items-center gap-1">
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
};

// Enhanced Input with error styling
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, hint, required, className, ...props }, ref) => {
        return (
            <FormField label={label} error={error} hint={hint} required={required}>
                <Input
                    ref={ref}
                    className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
                    {...props}
                />
            </FormField>
        );
    }
);

FormInput.displayName = "FormInput";

// Enhanced Textarea with error styling
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, hint, required, className, ...props }, ref) => {
        return (
            <FormField label={label} error={error} hint={hint} required={required}>
                <Textarea
                    ref={ref}
                    className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
                    {...props}
                />
            </FormField>
        );
    }
);

FormTextarea.displayName = "FormTextarea";

export default FormField;
