import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";

interface InsightCardProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    onDismiss?: () => void;
    type?: "insight" | "warning" | "success";
}

export function InsightCard({ title, description, actionLabel, onAction, onDismiss, type = "insight" }: InsightCardProps) {
    const isWarning = type === "warning";
    const isSuccess = type === "success";

    const bgGlow = isWarning 
        ? 'bg-[hsl(var(--admin-wine))]/5' 
        : isSuccess 
        ? 'bg-emerald-500/5' 
        : 'bg-[hsl(var(--admin-primary))]/5';

    const iconBg = isWarning 
        ? 'bg-[hsl(var(--admin-wine))]/10 text-[hsl(var(--admin-wine))]' 
        : isSuccess 
        ? 'bg-emerald-500/10 text-emerald-500' 
        : 'bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))]';

    const actionTextClass = isWarning 
        ? 'text-[hsl(var(--admin-wine))] hover:text-[hsl(var(--admin-wine))]' 
        : isSuccess 
        ? 'text-emerald-500 hover:text-emerald-500' 
        : 'text-[hsl(var(--admin-primary))] hover:text-[hsl(var(--admin-primary))]';

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--admin-card))] to-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] p-5 shadow-lg group">
            {/* BG ambient glow */}
            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full ${bgGlow} blur-3xl`} />
            
            <div className="flex gap-4 relative z-10 w-full">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1 pr-4">
                    <div className="flex items-start justify-between w-full">
                        <h4 className="font-medium text-[hsl(var(--admin-foreground))] text-sm">{title}</h4>
                        {onDismiss && (
                            <button 
                                onClick={onDismiss} 
                                className="absolute top-0 right-0 text-[hsl(var(--admin-text-subtle))] hover:text-[hsl(var(--admin-foreground))] transition-colors p-1 rounded-md hover:bg-[hsl(var(--admin-surface-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-card))]"
                                aria-label="Dismiss insight"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))] leading-relaxed max-w-[95%]">
                        {description}
                    </p>
                    
                    {actionLabel && (
                        <div className="pt-3">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`text-[11px] h-7 px-0 font-medium ${actionTextClass} bg-transparent hover:bg-transparent tracking-wide hover:underline hover:translate-x-1 transition-transform`}
                                onClick={onAction}
                            >
                                {actionLabel}
                                <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
