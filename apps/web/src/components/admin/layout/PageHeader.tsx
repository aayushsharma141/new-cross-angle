import React from 'react';
import { cn } from '../../../lib/utils';
import { textClasses } from '../../../design-system/tokens/typography';

export interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode; // Actions/buttons slot
    className?: string;
}

export const PageHeader = ({ title, description, children, className }: PageHeaderProps) => {
    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center justify-between mb-8", className)}>
            <div>
                <h1 className={cn(textClasses.h2)}>{title}</h1>
                {description && (
                    <p className={cn(textClasses.body, "mt-1")}>{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
};
