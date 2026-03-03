import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, Scan, Layers } from 'lucide-react';
import { MaterialData } from './data';
import { cn } from '@/lib/utils';

interface ZoomPanelProps {
    material: MaterialData;
}

export const ZoomPanel: React.FC<ZoomPanelProps> = ({ material }) => {
    const [level, setLevel] = useState<'room' | 'surface' | 'macro'>('room');

    return (
        <div className="relative w-full h-[300px] lg:h-[400px] bg-black/50 rounded-2xl overflow-hidden border border-white/10 group">

            {/* The Image (Simulated Zoom) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${material.id}-${level}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{
                        opacity: 1,
                        scale: level === 'room' ? 1 : level === 'surface' ? 1.5 : 3,
                        filter: level === 'macro' ? 'contrast(1.2) brightness(0.9)' : 'none'
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${material.image})` }}
                />
            </AnimatePresence>

            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 p-1 flex gap-1 z-20">
                {[
                    { id: 'room', icon: Layers, label: 'Space' },
                    { id: 'surface', icon: Scan, label: 'Surface' },
                    { id: 'macro', icon: ZoomIn, label: 'Texture' },
                ].map((btn) => (
                    <button
                        key={btn.id}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={() => setLevel(btn.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all",
                            level === btn.id
                                ? "bg-white text-black shadow-lg"
                                : "text-white/50 hover:text-white"
                        )}
                    >
                        <btn.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Risk Factors Overlay (Only visible in Macro mode) */}
            {level === 'macro' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none"
                >
                    {material.risk.factors.map((factor, i) => (
                        <div key={i} className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-xl">
                            ⚠️ {factor}
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};
