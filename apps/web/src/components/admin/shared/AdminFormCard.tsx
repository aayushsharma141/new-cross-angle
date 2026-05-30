import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";

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
        <Card className={cn("border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden", className)}>
            <CardHeader className="bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border-subtle))] py-3 px-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={cn("text-[hsl(var(--admin-primary))] h-4 w-4", iconClassName)} />}
                        <CardTitle className="text-sm font-bold text-[hsl(var(--admin-text))] flex items-center">{title}</CardTitle>
                    </div>
                    {description && <CardDescription className="text-xs text-[hsl(var(--admin-text-muted))]">{description}</CardDescription>}
                </div>
                {action && <div>{action}</div>}
            </CardHeader>
            <CardContent className={cn("p-5", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}
