import { AlertCircle, XCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ErrorBannerProps {
    title?: string;
    message: string;
    variant?: 'error' | 'warning' | 'info' | 'success';
    className?: string;
    onDismiss?: () => void;
}

export const ErrorBanner = ({
    title,
    message,
    variant = 'error',
    className,
    onDismiss
}: ErrorBannerProps) => {
    const Icon = {
        error: XCircle,
        warning: AlertCircle,
        info: Info,
        success: CheckCircle,
    }[variant];

    const variants = {
        error: "bg-error/10 border-error/50 text-error-dark dark:text-error-light",
        warning: "bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400",
        info: "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400",
        success: "bg-success/10 border-success/50 text-success-dark dark:text-success-light",
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                "flex items-start gap-4 p-4 border rounded-xl",
                variants[variant],
                className
            )}
        >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
                <p className="text-sm opacity-90 break-words">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Dismiss message"
                >
                    <XCircle className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
            )}
        </div>
    );
};
