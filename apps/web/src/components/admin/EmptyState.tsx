import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg bg-muted/30",
            className
        )}>
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold mb-2">{title}</h3>

            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm px-4">
                {description}
            </p>

            {(primaryAction || secondaryAction) && (
                <div className="flex gap-3">
                    {secondaryAction && (
                        <Button
                            variant="outline"
                            onClick={secondaryAction.onClick}
                        >
                            {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 mr-2" />}
                            {secondaryAction.label}
                        </Button>
                    )}

                    {primaryAction && (
                        <Button onClick={primaryAction.onClick}>
                            {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
                            {primaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
