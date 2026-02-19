
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { VisualizerCanvas } from '../../calculators/AtmosphereOrchestrator/VisualizerCanvas';

export const AtmosphereVisualizer = () => {
    const { atmosphere } = useStudio();
    const { inputs, stats } = atmosphere;

    return (
        <div className="w-full h-full relative">
            <VisualizerCanvas
                roomType={inputs.roomType}
                kelvin={stats.kelvin}
                dimmerLevel={inputs.intensity}
                isDoubleHeight={inputs.height === 'double'}
            />
            {/* Overlay Gradient for Studio Feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 pointer-events-none" />
        </div>
    );
};
