"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Maximize2, Info, ArrowRight, Settings2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Room Types with Background Images (using high-quality Unsplash placeholders)
const ROOM_TYPES = [
    {
        id: 'living',
        name: 'Living Room',
        multiplier: 20,
        icon: '🛋️',
        description: 'Warm, ambient lighting for social spaces.',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'kitchen',
        name: 'Culinary Studio',
        multiplier: 40,
        icon: '🍳',
        description: 'High-clarity lighting for precision tasks.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'bedroom',
        name: 'Sanctuary Corner',
        multiplier: 15,
        icon: '🌙',
        description: 'Soft, relaxing illumination for rest.',
        image: 'https://images.unsplash.com/photo-1616594039964-40809119bd54?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'office',
        name: 'Executive Suite',
        multiplier: 50,
        icon: '💼',
        description: 'Focus-oriented lighting for productivity.',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop'
    },
];

export default function LightingCalculator() {
    // Core State
    const [area, setArea] = useState(400);
    const [selectedType, setSelectedType] = useState(ROOM_TYPES[0]);
    const [isDoubleHeight, setIsDoubleHeight] = useState(false);

    // Advanced State
    const [colorTemp, setColorTemp] = useState<'warm' | 'neutral' | 'cool'>('warm');

    // Calculations
    const ceilingMultiplier = isDoubleHeight ? 1.5 : 1.0;
    const targetLumens = useMemo(() => Math.round(area * selectedType.multiplier * ceilingMultiplier), [area, selectedType, ceilingMultiplier]);
    const wattage = useMemo(() => Math.ceil(targetLumens / 80), [targetLumens]); // ~80 lumens/watt for premium LED

    // Cost Estimation (INR)
    // Base cost: ~₹15 per lumen for high-CRI fixtures + installation factor
    // This is a rough estimation logic for the "Architecture of Anticipation" tier
    const estimatedCost = useMemo(() => {
        const baseRate = 12; // ₹12 per required lumen (fixture cost)
        const installationFactor = 0.3; // 30% for installation
        const total = targetLumens * baseRate * (1 + installationFactor);
        return Math.round(total / 1000) * 1000; // Round to nearest 1000
    }, [targetLumens]);

    // Visualizer Opacity Calculation
    // Normalize opacity based on "ideal" vs "current" area intensity
    // For visual effect: we simulate that the "current setup" is adapting to the required lumens
    // So distinct from a "dimmer", this visualizes the Resulting Ambiance of the calculated lumens.
    const visualizerOpacity = Math.min(0.85, Math.max(0.3, (targetLumens / (area * 30)) * 0.8));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(amount);
    };

    return (
        <div className="w-full max-w-6xl mx-auto rounded-[2rem] bg-zinc-900/50 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[800px]">

            {/* ═══ LEFT PANEL: CONTROLS & DATA ═══ */}
            <div className="w-full lg:w-[45%] p-8 lg:p-10 flex flex-col h-full bg-zinc-900/80 relative z-10 border-r border-white/5">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-white tracking-wide">Lumens Visualizer</h2>
                    </div>
                    <p className="text-white/40 text-sm pl-1">Precision lighting estimation for bespoke interiors.</p>
                </div>

                {/* Controls Container */}
                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                    {/* Room Type Grid */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Space Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {ROOM_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className={cn(
                                        "p-4 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden",
                                        selectedType.id === type.id
                                            ? "bg-white/10 text-white border-orange-500/50 shadow-lg shadow-orange-500/10"
                                            : "bg-white/5 text-white/60 border-transparent hover:bg-white/10"
                                    )}
                                >
                                    <div className="text-xl mb-2 group-hover:scale-110 transition-transform duration-500">{type.icon}</div>
                                    <div className="font-medium text-sm">{type.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dimensions & Height */}
                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                        {/* Area */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Maximize2 className="w-4 h-4 text-orange-500" />
                                    <label htmlFor="area-slider" className="text-xs font-bold text-white/70 uppercase tracking-widest">
                                        Area
                                    </label>
                                </div>
                                <span className="text-lg font-serif font-bold text-white">
                                    {area} <span className="text-[10px] text-white/40 font-sans uppercase">sqft</span>
                                </span>
                            </div>
                            <input
                                id="area-slider"
                                type="range"
                                min="100"
                                max="2000"
                                step="50"
                                value={area}
                                onChange={(e) => setArea(Number(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                aria-label="Area in square feet"
                            />
                        </div>

                        {/* Ceiling Height Toggle */}
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <label htmlFor="height-toggle" className="text-xs font-bold text-white/70 uppercase tracking-widest">Double Height Ceiling</label>
                            {isDoubleHeight ? (
                                <button
                                    id="height-toggle"
                                    onClick={() => setIsDoubleHeight(!isDoubleHeight)}
                                    className={cn(
                                        "w-12 h-7 rounded-full transition-colors duration-300 relative focus:outline-none",
                                        "bg-orange-500"
                                    )}
                                    aria-label="Toggle Double Height Ceiling"
                                    aria-pressed="true"
                                >
                                    <div className={cn(
                                        "w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300",
                                        "left-6"
                                    )} />
                                </button>
                            ) : (
                                <button
                                    id="height-toggle"
                                    onClick={() => setIsDoubleHeight(!isDoubleHeight)}
                                    className={cn(
                                        "w-12 h-7 rounded-full transition-colors duration-300 relative focus:outline-none",
                                        "bg-white/10"
                                    )}
                                    aria-label="Toggle Double Height Ceiling"
                                    aria-pressed="false"
                                >
                                    <div className={cn(
                                        "w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300",
                                        "left-1"
                                    )} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Temperature Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Ambiance</label>
                        <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
                            {(['warm', 'neutral', 'cool'] as const).map((temp) => (
                                <button
                                    key={temp}
                                    onClick={() => setColorTemp(temp)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all",
                                        colorTemp === temp
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-white/40 hover:text-white/70"
                                    )}
                                >
                                    {temp}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Results Preview */}
                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Est. Project Cost (INR)</div>
                            <div className="text-2xl font-serif font-bold text-white">
                                {formatCurrency(estimatedCost)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Light Output</div>
                            <div className="text-xl font-bold text-orange-400">{targetLumens.toLocaleString()} lm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT PANEL: VISUALIZER CANVAS ═══ */}
            <div className="w-full lg:w-[55%] relative overflow-hidden bg-black h-[400px] lg:h-auto">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={selectedType.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                    >
                        {/* Base Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                            style={{ backgroundImage: `url(${selectedType.image})` }}
                        />

                        {/* Lighting Overlay - Opacity controls brightness */}
                        <motion.div
                            className="absolute inset-0 bg-black"
                            animate={{ opacity: 1 - visualizerOpacity }}
                            transition={{ duration: 0.4 }}
                        />

                        {/* Temperature Overlay */}
                        <div className={cn(
                            "absolute inset-0 mix-blend-overlay transition-colors duration-500",
                            colorTemp === 'warm' && "bg-orange-500/20",
                            colorTemp === 'neutral' && "bg-blue-100/10",
                            colorTemp === 'cool' && "bg-blue-500/20"
                        )} />

                        {/* Light Bloom Effect */}
                        <div className={cn(
                            "absolute inset-0 mix-blend-screen pointer-events-none opacity-50",
                            colorTemp === 'warm' && "bg-gradient-to-t from-orange-500/10 to-transparent",
                            colorTemp === 'cool' && "bg-gradient-to-t from-blue-500/10 to-transparent",
                        )} />

                    </motion.div>
                </AnimatePresence>

                {/* HUD Overlay */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            colorTemp === 'warm' ? "bg-orange-400" : colorTemp === 'neutral' ? "bg-white" : "bg-blue-400"
                        )} />
                        <span className="text-xs font-mono text-white/80">
                            {colorTemp === 'warm' ? '2700K' : colorTemp === 'neutral' ? '4000K' : '6000K'}
                        </span>
                    </div>
                    {isDoubleHeight && (
                        <div className="bg-orange-500/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                            Double Height Mode
                        </div>
                    )}
                </div>

                {/* Action Button Overlay */}
                <div className="absolute bottom-8 left-8 right-8">
                    <button className="w-full py-4 bg-white text-black rounded-xl font-bold shadow-2xl hover:bg-orange-50 text-sm uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
                        <Settings2 className="w-4 h-4" />
                        Generate Detailed Lighting Plan
                    </button>
                </div>
            </div>

        </div>
    );
}
