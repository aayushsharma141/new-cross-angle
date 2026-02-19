
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MATERIALS } from '../../calculators/MaterialEstimator/data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const MaterialVisualizer = () => {
    const { selectedMaterialId } = useStudio();
    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0];

    return (
        <div className="w-full h-full relative overflow-hidden bg-zinc-950">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedMaterial.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Color/Base */}
                    <div className={cn(
                        "absolute inset-0 transition-colors duration-1000 opacity-20",
                        selectedMaterial.color.replace('bg-', 'bg-')
                    )} />

                    {/* Texture Pattern Overlay */}
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.1%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                    {/* Image (if available) - Blended */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay grayscale-[30%] contrast-125"
                        style={{ backgroundImage: `url(${selectedMaterial.image})` }}
                    />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                </motion.div>
            </AnimatePresence>

            {/* Label Overlay */}
            <div className="absolute bottom-12 left-12 z-10">
                <motion.div
                    key={selectedMaterial.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Selected Material</div>
                    <h2 className="text-4xl font-serif text-white">{selectedMaterial.name}</h2>
                    <p className="text-white/60 text-sm max-w-md mt-2 italic">"{selectedMaterial.description}"</p>
                </motion.div>
            </div>
        </div>
    );
};
