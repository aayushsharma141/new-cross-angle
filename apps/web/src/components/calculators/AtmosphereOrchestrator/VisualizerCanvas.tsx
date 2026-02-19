import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOM_STANDARDS } from './data';
import { cn } from '@/lib/utils';
import { Sun } from 'lucide-react';

interface VisualizerCanvasProps {
    roomType: string;
    kelvin: number;
    dimmerLevel: number;
    isDoubleHeight?: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
    roomType,
    kelvin,
    dimmerLevel,
    isDoubleHeight = false
}) => {
    // Convert Kelvin to RGB overlay string
    // 2200K = Candle/Sunset -> rgba(255, 147, 41, ...)
    // 3000K = Warm White -> rgba(255, 197, 143, ...)
    // 4000K = Neutral -> rgba(255, 255, 255, ...)
    // 6000K = Cool Daylight -> rgba(201, 226, 255, ...)
    const getKelvinColor = (k: number) => {
        if (k <= 2700) return 'rgba(255, 160, 60, 0.45)'; // Rich Warm
        if (k <= 3000) return 'rgba(255, 200, 140, 0.35)'; // Soft Warm
        if (k <= 4000) return 'rgba(255, 245, 220, 0.2)'; // Neutral Warm
        if (k <= 5000) return 'rgba(255, 255, 255, 0.15)'; // Pure Neutral
        return 'rgba(200, 230, 255, 0.3)'; // Cool Blue
    };

    const opacity = dimmerLevel / 100;
    const standard = ROOM_STANDARDS[roomType];

    return (
        <div className="relative w-full h-[400px] lg:h-full min-h-[400px] overflow-hidden bg-black/90">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={roomType}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* 1. Base Room Image (Grayscale helps lighting pop) */}
                    <div
                        className="absolute inset-0 bg-cover bg-center filter grayscale-[20%] contrast-110"
                        style={{ backgroundImage: `url(${standard.image})` }}
                    />

                    {/* 2. The "Light" Layer (Mix Blend Mode: Soft Light/Overlay) */}
                    <motion.div
                        className="absolute inset-0 transition-colors duration-500 will-change-[background-color,opacity]"
                        style={{
                            backgroundColor: getKelvinColor(kelvin),
                            mixBlendMode: 'overlay',
                        }}
                        animate={{ opacity: opacity }}
                        transition={{ duration: 0.4 }}
                    />

                    {/* 3. Shadow/Vignette Layer (Creates depth when light is low) */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{
                            background: `radial-gradient(circle at 50% 50%, transparent ${20 + (dimmerLevel / 2)}%, black 140%)`,
                            opacity: 1 - (opacity * 0.8)
                        }}
                        transition={{ duration: 0.4 }}
                    />

                    {/* Light Bloom Effect for High Brightness */}
                    {opacity > 0.7 && (
                        <motion.div
                            className="absolute inset-0 bg-white/10 mix-blend-screen pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: (opacity - 0.7) * 0.5 }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* 4. "Lux Meter" HUD */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white flex items-center gap-3 shadow-xl">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Ambiance</span>
                        <div className="font-mono text-xl leading-none tracking-tight">{kelvin}K</div>
                    </div>
                    <div
                        className="w-1.5 h-8 rounded-full transition-colors duration-500"
                        style={{
                            background: `linear-gradient(to bottom, ${getKelvinColor(kelvin).replace(/[\d.]+\)$/, '1)')}, transparent)`
                        }}
                    />
                </div>

                {isDoubleHeight && (
                    <div className="bg-orange-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Sun className="w-3 h-3 text-white" />
                        Double Height
                    </div>
                )}
            </div>

            {/* Room Label */}
            <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-serif font-bold text-white drop-shadow-lg">{standard.label}</h3>
                <p className="text-white/60 text-sm uppercase tracking-widest">Atmosphere Simulation // {dimmerLevel}%</p>
            </div>
        </div>
    );
};
