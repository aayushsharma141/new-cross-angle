import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskBadgeProps {
    level: 'Low' | 'Medium' | 'High';
    label?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, label }) => {
    const styles = {
        Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ShieldCheck },
        Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Shield },
        High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert },
    };

    const Config = styles[level];
    const Icon = Config.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide",
            Config.bg, Config.color, Config.border
        )}>
            <Icon className="w-3 h-3" />
            {label || `${level} Risk`}
        </div>
    );
};
