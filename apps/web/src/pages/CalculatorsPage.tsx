import React from 'react';
import { StudioProvider } from '../components/studio/context/StudioContext';
import { StudioSidebar } from '../components/studio/StudioSidebar';
import { StudioCanvas } from '../components/studio/StudioCanvas';
import { ControlPanel } from '../components/studio/ControlPanel';

// Layout Component that consumes the context
const StudioLayout = () => {
    return (
        <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-emerald-500/30 relative">

            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Subtle Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20200%20200%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27noiseFilter%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.65%27%20numOctaves=%273%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23noiseFilter)%27%20opacity=%271%27/%3E%3C/svg%3E')]" />

                {/* Vignette & Ambient Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>

            {/* Main Application Structure */}
            <div className="relative z-10 flex w-full h-full">

                {/* Persistent Sidebar Navigation */}
                <StudioSidebar />

                {/* Central Workspace Canvas */}
                <main className="flex-1 relative flex flex-col min-h-0 bg-gradient-to-br from-white/[0.02] to-transparent perspective-1000">

                    {/* The Canvas renders the active visualizer */}
                    <StudioCanvas />

                    {/* Floating Control Panel */}
                    <ControlPanel />

                </main>
            </div>
        </div>
    );
};

export default function CalculatorsPage() {
    return (
        <StudioProvider>
            <StudioLayout />
        </StudioProvider>
    );
}
