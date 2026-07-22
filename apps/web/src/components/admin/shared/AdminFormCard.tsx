import React from 'react';
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Surface, Text, Stack } from "@/components/primitives/foundation";

interface AdminFormCardProps {
    title: ReactNode;
    description?: string;
    icon?: React.ElementType;
    iconClassName?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function AdminFormCard({ title, description, icon: Icon, iconClassName, action, children, className, contentClassName }: AdminFormCardProps) {
    return (
        <Surface variant="primary" radius="lg" border shadow="sm" className={cn("border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden", className)}>
            <Stack gap="sm" className="p-6" className="bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border-subtle))] py-3 px-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={cn("text-[hsl(var(--admin-primary))] h-4 w-4", iconClassName)} />}
                        <Text as="h3" variant="h3" className="leading-none" className="text-sm font-bold text-[hsl(var(--admin-text))] flex items-center">{title}</Text>
                    </div>
                    {description && <Text as="p" variant="caption" color="muted" className="text-xs text-[hsl(var(--admin-text-muted))]">{description}</Text>}
                </div>
                {action && <div>{action}</div>}
            </Stack>
            <div className="p-6 pt-0" className={cn("p-5", contentClassName)}>
                {children}
            </div>
        </Surface>
    );
}
