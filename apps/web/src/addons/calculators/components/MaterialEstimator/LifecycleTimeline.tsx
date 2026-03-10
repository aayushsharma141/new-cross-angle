import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wrench, AlertTriangle, Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { MaterialData } from './data';

interface LifecycleTimelineProps {
    material: MaterialData;
    area: number;
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ material, area }) => {

    // Calculations
    const initialCost = (material.price * area) + (material.wastage.transportCost * area); // Simplified install logic
    const annualMaintenance = material.lifecycle.maintenancePerYear * area;

    // 5 Year Projection
    const years = [1, 2, 3, 4, 5];
    const dataPoints = years.map(year => {
        let cost = initialCost + (annualMaintenance * year);
        if (year >= material.lifecycle.refinishingPeriod && material.lifecycle.refinishingPeriod > 0) {
            // Add refinishing cost once in the period
            if (year % material.lifecycle.refinishingPeriod === 0) {
                cost += material.lifecycle.refinishingCost * area;
            }
        }
        return cost;
    });

    const total5YearCost = dataPoints[4];
    const percentageIncrease = ((total5YearCost - initialCost) / initialCost) * 100;

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        5-Year Ownership Reality
                    </h3>
                    <p className="text-xs text-white/40 mt-1">Initial Investment vs. True Cost</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-serif text-white">{formatINR(total5YearCost)}</div>
                    <div className={`text-xs font-bold ${percentageIncrease > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                        +{Math.round(percentageIncrease)}% over 5 years
                    </div>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="relative h-32 flex items-end justify-between gap-2 pt-8">
                {/* Connecting Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" overflow="visible">
                    <path
                        d={`M 0,${100} L ${years.map((y, i) => `${(i * 25)}%,${100 - ((dataPoints[i] / total5YearCost) * 80)}`).join(' L ')}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    />
                </svg>

                {years.map((year, index) => {
                    const heightPercent = 20 + ((dataPoints[index] / total5YearCost) * 60);
                    const isRefinishYear = material.lifecycle.refinishingPeriod > 0 && year % material.lifecycle.refinishingPeriod === 0;

                    return (
                        <div key={year} className="relative flex flex-col items-center group w-1/5">
                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`w-full max-w-[20px] rounded-t-lg transition-all duration-300 ${isRefinishYear ? 'bg-amber-500/50' : 'bg-white/10 group-hover:bg-white/20'
                                    }`}
                            />

                            {/* Year Label */}
                            <span className="text-[10px] text-white/30 mt-2 font-mono">Y{year}</span>

                            {/* Tooltip for Refinish */}
                            {isRefinishYear && (
                                <div className="absolute -top-8 bg-amber-500/90 text-black text-[9px] font-bold px-2 py-1 rounded">
                                    REFINISH
                                </div>
                            )}

                            {/* Hover Value */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 text-white text-xs p-1 rounded">
                                {formatINR(dataPoints[index])}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Insight */}
            <div className="bg-black/40 rounded-lg p-3 flex gap-3 border border-white/5">
                {percentageIncrease < 15 ? (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <p className="text-xs text-white/60 leading-relaxed">
                    {percentageIncrease < 15
                        ? <span><strong>Low Opex Asset:</strong> {material.name} requires minimal upkeep, making it a high-yield long-term choice.</span>
                        : <span><strong>High Maintenance:</strong> Expect significant spend on polishing/sealing in Year {material.lifecycle.refinishingPeriod}. Factor this into your budget.</span>
                    }
                </p>
            </div>
        </div>
    );
};
