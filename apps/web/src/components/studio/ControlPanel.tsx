
"use client";

import React, { useState } from 'react';
import { useStudio } from './context/StudioContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AtmosphereControls } from './controls/AtmosphereControls';
import { MaterialControls } from './controls/MaterialControls';
import { StrategyControls } from './controls/StrategyControls';

export const ControlPanel = () => {
    const { activeTab } = useStudio();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // If we're on the report tab, maybe we don't show controls?
    if (activeTab === 'report') return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "absolute top-6 right-6 md:top-12 md:right-12 z-30 flex flex-col items-end",
                isCollapsed ? "w-auto" : "w-full max-w-sm"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mb-4 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg hover:bg-white/10 transition-colors"
            >
                {isCollapsed ? <Settings2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </button>

            {/* Main Panel Content */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
                                {activeTab === 'atmosphere' && 'Lighting Configuration'}
                                {activeTab === 'investment' && 'Material Selection'}
                                {activeTab === 'strategy' && 'Growth Parameters'}
                            </h3>
                        </div>

                        {/* Dynamic Controls based on Tab */}
                        <div className="space-y-6">
                            {activeTab === 'atmosphere' && <AtmosphereControls />}

                            {activeTab === 'investment' && <MaterialControls />}

                            {activeTab === 'strategy' && <StrategyControls />}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
