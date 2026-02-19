
"use client";

import React from 'react';
import { useStudio, StudioTab } from './context/StudioContext';
import { Lightbulb, Layers, TrendingUp, FileText, ChevronRight, Home } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used, or generic link

interface NavItemProps {
    id: StudioTab;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                isActive ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            )}
        >
            <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive ? "bg-white/10 text-white" : "bg-transparent group-hover:bg-white/5"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium tracking-wide text-sm hidden md:block">{label}</span>

            {isActive && (
                <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full"
                />
            )}
        </button>
    );
};

export const StudioSidebar = () => {
    const { activeTab, setActiveTab, totalCost } = useStudio();

    return (
        <aside className="h-full w-20 md:w-64 bg-black/80 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between z-20 transition-all duration-300">

            {/* Header / Logo Area */}
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8">
                    <Home className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest hidden md:block">Exit Studio</span>
                </Link>
                <div className="hidden md:block">
                    <h1 className="text-xl font-serif text-white leading-tight">
                        Digital<br />Intelligence
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2">
                <NavItem
                    id="atmosphere"
                    icon={Lightbulb}
                    label="Atmosphere"
                    isActive={activeTab === 'atmosphere'}
                    onClick={() => setActiveTab('atmosphere')}
                />
                <NavItem
                    id="investment"
                    icon={Layers}
                    label="Tactile Investment"
                    isActive={activeTab === 'investment'}
                    onClick={() => setActiveTab('investment')}
                />
                <NavItem
                    id="strategy"
                    icon={TrendingUp}
                    label="Long-Term Strategy"
                    isActive={activeTab === 'strategy'}
                    onClick={() => setActiveTab('strategy')}
                />
                <div className="h-px w-full bg-white/5 my-4" />
                <NavItem
                    id="report"
                    icon={FileText}
                    label="Executive Report"
                    isActive={activeTab === 'report'}
                    onClick={() => setActiveTab('report')}
                />
            </nav>

            {/* Mini Footer / Live Total */}
            <div className="p-6 border-t border-white/5 bg-white/5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 hidden md:block">Estimated Project</div>
                <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-mono text-lg">{formatINR(totalCost)}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
            </div>

        </aside>
    );
};
