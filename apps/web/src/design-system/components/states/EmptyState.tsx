import React from 'react';
import { cn } from '../../../lib/utils';
import { textClasses } from '../../tokens/typography';

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
    illustrationName?: string; // Opt for custom icon/illustration later
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 text-center",
                "border-2 border-dashed border-border rounded-xl bg-surface/50",
                "min-h-[400px]",
                className
            )}
        >
            {Icon && (
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-surface-muted mb-6 text-text-muted">
                    <Icon className="w-8 h-8 opacity-50" />
                </div>
            )}
            <h3 className={cn(textClasses.h3, "mb-2")}>{title}</h3>
            <p className={cn(textClasses.body, "text-text-muted max-w-sm mx-auto mb-6")}>
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
};
