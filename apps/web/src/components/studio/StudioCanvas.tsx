
"use client";

import React from 'react';
import { useStudio } from './context/StudioContext';
import { AnimatePresence, motion } from 'framer-motion';
import { AtmosphereVisualizer } from './visualizers/AtmosphereVisualizer';
import { MaterialVisualizer } from './visualizers/MaterialVisualizer';
import { StrategyVisualizer } from './visualizers/StrategyVisualizer';

import { ReportView } from './visualizers/ReportView'; // Implemented below

// Placeholder Report View -> Move to file later
// const ReportView... (deleted)

export const StudioCanvas = () => {
    const { activeTab } = useStudio();

    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full absolute inset-0"
                >
                    {activeTab === 'atmosphere' && <AtmosphereVisualizer />}
                    {activeTab === 'investment' && <MaterialVisualizer />}
                    {activeTab === 'strategy' && <StrategyVisualizer />}
                    {activeTab === 'report' && <ReportView />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
