
"use client";

import React from 'react';
import { StudioProvider } from './context/StudioContext';
import { StudioSidebar } from './StudioSidebar';
import { StudioCanvas } from './StudioCanvas';
import { ControlPanel } from './ControlPanel';

export const StudioLayout = () => {
    return (
        <StudioProvider>
            <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
                <StudioSidebar />
                <main className="flex-1 relative h-full">
                    <StudioCanvas />
                    <ControlPanel />
                </main>
            </div>
        </StudioProvider>
    );
};
