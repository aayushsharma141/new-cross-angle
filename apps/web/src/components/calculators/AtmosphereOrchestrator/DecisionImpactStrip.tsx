import React from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils'; // Assuming this utility exists, otherwise import local helper

interface DecisionImpactStripProps {
    impact: {
        visual: number;
        energy: string;
        maintenance: string;
        flexibility: string;
    };
    marketScenario: string;
    onScenarioChange: (scenario: string) => void;
    fiveYearCost: number;
    initialCost: number;
}

export const DecisionImpactStrip: React.FC<DecisionImpactStripProps> = ({
    impact,
    marketScenario,
    onScenarioChange,
    fiveYearCost,
    initialCost
}) => {

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="mt-8 space-y-6">

            {/* Decision Impact Metrcis */}
            <div className="grid grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/5">
                {/* Visual Score */}
                <div className="bg-zinc-900/80 p-4 flex flex-col items-center justify-center text-center group">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Visual Impact</span>
                    <div className="text-xl font-bold text-white relative">
                        {impact.visual}<span className="text-xs text-white/30 font-normal">/100</span>
                        <div className="absolute -bottom-1 w-full h-0.5 bg-gradient-to-r from-red-500 to-green-500 opacity-30" />
                    </div>
                </div>

                {/* Energy Cost */}
                <div className="bg-zinc-900/80 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Running Cost</span>
                    <div className="text-sm font-mono text-orange-300">
                        {impact.energy}
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-zinc-900/80 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Maintenance</span>
                    <div className={`text-sm font-bold ${impact.maintenance === 'Zero' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {impact.maintenance}
                    </div>
                </div>

                {/* Flexibility */}
                <div className="bg-zinc-900/80 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Start-up</span>
                    <div className="text-sm font-mono text-emerald-400">
                        {formatMoney(initialCost)}
                    </div>
                </div>
            </div>

            {/* Market Sensitivity & Lifecycle */}
            <div className="bg-white/5 rounded-xl border border-white/5 p-5 relative overflow-hidden">

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            5-Year Lifecycle Projection
                        </h4>
                        <p className="text-xs text-white/40 mt-1">Total Cost of Ownership (Capex + Opex)</p>
                    </div>

                    {/* Scenario Toggle */}
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        {[
                            { id: 'stable', label: 'Stable' },
                            { id: 'inflation', label: 'Inflation +6%' },
                            { id: 'energy_spike', label: 'Energy High' },
                        ].map(scene => (
                            <button
                                key={scene.id}
                                onClick={() => onScenarioChange(scene.id)}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${marketScenario === scene.id
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/30 hover:text-white/50'
                                    }`}
                            >
                                {scene.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* The Big Number */}
                <div className="flex items-baseline gap-4 relative z-10">
                    <div className="text-3xl font-serif text-white">
                        {formatMoney(fiveYearCost)}
                    </div>
                    <div className="text-xs text-white/40">
                        cumulative spend over 60 months
                    </div>
                </div>

                {/* Dynamic Insight */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3 relative z-10">
                    {impact.maintenance === 'Zero' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    )}
                    <p className="text-xs text-white/60 leading-relaxed italic">
                        {impact.maintenance === 'Zero'
                            ? "Investment Grade: High upfront cost offset by near-zero maintenance and extended lifespan."
                            : "Standard Grade: Lower initial cost, but expect higher maintenance cycles after year 3."}
                    </p>
                </div>

                {/* Background Graph Decoration */}
                <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 50" className="w-full h-full fill-none stroke-white" strokeWidth="2">
                        <path d="M0 50 Q 50 40 100 10" />
                        <path d="M0 50 Q 50 45 100 25" className="opacity-50" />
                        <path d="M0 50 Q 50 48 100 40" className="opacity-20" />
                    </svg>
                </div>
            </div>

        </div>
    );
};
