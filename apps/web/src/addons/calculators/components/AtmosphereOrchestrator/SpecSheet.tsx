import React from 'react';
import { LIGHTING_MARKET_DATA } from './data';
import { ArrowUpRight, Zap, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecSheetProps {
    stats: {
        lumens: number;
        wattage: number;
        fixtureCount: number;
        costs: {
            material: number;
            driver: number;
            install: number;
            total: number;
        };
        recommendation: string;
    };
    tier: string;
}

export const SpecSheet: React.FC<SpecSheetProps> = ({ stats, tier }) => {
    const tierData = LIGHTING_MARKET_DATA[tier as keyof typeof LIGHTING_MARKET_DATA];

    const formatINR = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-zinc-900/80 rounded-3xl border border-white/5 p-6 backdrop-blur-xl space-y-6 shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-white font-serif text-lg tracking-wide">Investment Strategy</h3>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Capital Allocation Breakdown</p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    tier === 'luxury' ? "bg-amber-500/10 border-amber-500/50 text-amber-500" :
                        tier === 'premium' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" :
                            "bg-white/5 border-white/10 text-white/50"
                )}>
                    {tierData.label}
                </div>
            </div>

            {/* Hero Numbers */}
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Load</span>
                    </div>
                    <div className="text-2xl font-light text-white font-mono">
                        {stats.wattage}<span className="text-sm text-white/30 ml-1">W</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <Banknote className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Budget</span>
                    </div>
                    <div className="text-2xl font-light text-white font-serif">
                        {formatINR(stats.costs.total)}
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm group">
                    <span className="text-white/40 group-hover:text-white/60 transition-colors">Fixtures ({stats.fixtureCount}x)</span>
                    <span className="text-white/80 font-mono text-xs opacity-60">{formatINR(stats.costs.material)}</span>
                </div>
                <div className="flex justify-between items-center text-sm group">
                    <span className="text-white/40 group-hover:text-white/60 transition-colors">Drivers & Control Gear</span>
                    <span className="text-white/80 font-mono text-xs opacity-60">{formatINR(stats.costs.driver)}</span>
                </div>
                <div className="flex justify-between items-center text-sm group">
                    <span className="text-white/40 group-hover:text-white/60 transition-colors">Precision Installation</span>
                    <span className="text-white/80 font-mono text-xs opacity-60">{formatINR(stats.costs.install)}</span>
                </div>

                <div className="h-px bg-white/5 my-2" />

                <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-medium tracking-wide">Total Investment</span>
                    <span className="text-white font-bold font-serif">{formatINR(stats.costs.total)}</span>
                </div>
            </div>

            {/* Strategic Insight */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors duration-500">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-start gap-3 relative z-10">
                    <ShieldCheck className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Analyst Insight</h4>
                        <p className="text-xs text-white/50 leading-relaxed italic">
                            "For this <strong>{stats.recommendation}</strong> zone, we recommend <strong>{tierData.label}</strong>.
                            {tier === 'economy'
                                ? ' Adequate for functional visibility.'
                                : tier === 'premium'
                                    ? ' Optimizes visual comfort and reduces eye strain.'
                                    : ' Museum-grade rendering for art and textures.'}
                            "
                        </p>
                    </div>
                </div>
            </div>

            {/* Action */}
            <button className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]">
                Download Strategy PDF
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

        </div>
    );
};
