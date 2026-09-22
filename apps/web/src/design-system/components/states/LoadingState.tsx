import React from 'react';
import { cn } from '../../../lib/utils';

export const Spinner = ({ className, size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={cn(
                "border-primary border-t-transparent rounded-full animate-spin",
                sizeClasses[size],
                className
            )}
        />
    );
};

interface LoadingStateProps {
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export const LoadingState = ({
    text = "Loading…",
    fullScreen = false,
    className
}: LoadingStateProps) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center z-50",
                fullScreen ? "h-screen w-full bg-surface text-text-primary" : "h-full min-h-[400px] w-full",
                className
            )}
        >
            <Spinner size={fullScreen ? 'lg' : 'md'} className="mb-4" />
            <p className="text-lg font-medium text-text-muted">
                {text}
            </p>
        </div>
    );
};
