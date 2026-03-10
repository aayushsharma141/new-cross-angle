/* Results — Final Estimate Display */

import type { CalculatorFormData, EstimateResult } from "../data/types";
import { formatCurrency, formatRange } from "../data/format-utils";
import { SERVICES, TIERS, THEME } from "../data/pricing-config";
import { Link } from "react-router-dom";
import { Home, ExternalLink, Calendar, Check, AlertTriangle, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
    formData: CalculatorFormData;
    estimate: EstimateResult | null;
    onReset: () => void;
    onBack: () => void;
}

export function StepResults({ formData, estimate, onReset, onBack }: Props) {
    if (!estimate) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-white text-xl font-serif font-bold mb-4">No Estimate Found</h3>
                <p className="text-gray-500 text-center max-w-xs mb-8">
                    It looks like we're missing some details to calculate your investment range.
                </p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const svc = SERVICES.find(s => s.id === formData.selectedService);
    const tierInfo = TIERS[formData.cityTier];
    const cityLabel = formData.city === 'Other' ? 'Other City' : formData.city;

    const breakdownItems: { label: string; value: string; color?: string; icon?: React.ReactNode }[] = [];

    if (estimate.designCost.min > 0) {
        breakdownItems.push({
            label: `Creative Fee`,
            value: formatRange(estimate.designCost.min, estimate.designCost.max),
            icon: <Calendar className="w-4 h-4" />
        });
    }
    if (estimate.gstOnDesign > 0) {
        breakdownItems.push({ label: "Statutory Tax (GST)", value: formatCurrency(estimate.gstOnDesign) });
    }
    if (estimate.supervisionCost > 0) {
        breakdownItems.push({
            label: `On-site Stewardship`,
            value: formatCurrency(estimate.supervisionCost),
        });
    }
    if (estimate.executionCost.min > 0) {
        breakdownItems.push({
            label: `Artisanal Execution`,
            value: formatRange(estimate.executionCost.min, estimate.executionCost.max),
            color: THEME.GOLD,
        });
    }
    if (estimate.addonCost > 0) {
        breakdownItems.push({ label: "Bespoke Commissions", value: formatCurrency(estimate.addonCost), color: THEME.GOLD });
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-20"
        >
            {/* Immersive Header Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 lg:p-14 border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl shadow-2xl">
                {/* Dynamic Aura */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.span
                        variants={itemVariants}
                        className="text-primary font-mono text-[10px] uppercase tracking-[0.5em] mb-4 block"
                    >
                        Investment Outlook
                    </motion.span>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter mb-8"
                    >
                        {formatRange(estimate.total.min, estimate.total.max)}
                    </motion.h2>

                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
                        <Badge label={formData.propertyType?.replace("_", " ") || ""} variant="glass" />
                        <Badge label={`${formData.area.toLocaleString()} sq ft`} variant="glass" />
                        {cityLabel && <Badge label={cityLabel} variant="gold" />}
                        {svc && <Badge label={svc.label} variant="primary" />}
                    </motion.div>
                </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Detailed Breakdown */}
                <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl transition-all hover:bg-white/[0.04]">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-white font-serif text-lg font-bold">Execution Intelligence</h3>
                            <div className="p-2 bg-white/5 rounded-full">
                                <ExternalLink className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        <div className="p-2">
                            {breakdownItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="flex justify-between items-center px-6 py-4 rounded-2xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary" />}
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        item.color === THEME.GOLD ? "text-yellow-500" : "text-white"
                                    )}>
                                        {item.value}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Indicative Total</p>
                                <p className="text-2xl font-serif font-bold text-white">{formatRange(estimate.total.min, estimate.total.max)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-gray-600 italic">Financial modeling includes<br />standard GST and contingency.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scope & Support */}
                <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
                    {/* Deliverables Card */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-white font-serif text-lg font-bold">Inclusions</h3>
                        </div>

                        <div className="space-y-4">
                            {svc?.includes.slice(0, 6).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 group-hover/item:scale-150 transition-transform" />
                                    <span className="text-gray-400 text-[11px] leading-relaxed group-hover/item:text-gray-200 transition-colors">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Navigation */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onReset}
                            className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group flex flex-col items-center gap-3"
                        >
                            <Home className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Restart</span>
                        </button>
                        <Link
                            to="/contact-us"
                            className="p-6 rounded-3xl bg-primary hover:bg-primary/90 transition-all group flex flex-col items-center gap-3 shadow-xl shadow-primary/20"
                        >
                            <PhoneCall className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-white">Consult</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div >
    );
}

function Badge({ label, variant = "glass" }: { label: string; variant?: "glass" | "primary" | "gold" }) {
    const variants = {
        glass: "bg-white/[0.05] text-gray-400 border-white/10",
        primary: "bg-primary/20 text-primary border-primary/30",
        gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    };

    return (
        <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border",
            variants[variant]
        )}>
            {label}
        </span>
    );
}
