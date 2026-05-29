import React from 'react';
import { DiscoveryEngine, DiscoveryConfig } from './DiscoveryEngine';
import { QuizErrorBoundary } from './QuizErrorBoundary';
import { AestheticScores, UserSignals, AIAestheticResult } from '@/types/discovery';

interface DiscoveryAddonProps {
    config?: DiscoveryConfig;
    onComplete?: (result: { scores: AestheticScores; signals: UserSignals; aiResult?: AIAestheticResult }) => void;
}

export const DiscoveryAddon: React.FC<DiscoveryAddonProps> = ({ config, onComplete }) => {
    return (
        <QuizErrorBoundary>
            <div className="discovery-addon-container overflow-hidden bg-background w-full min-h-[100dvh] relative">
                <DiscoveryEngine config={config} onComplete={onComplete} />
            </div>
        </QuizErrorBoundary>
    );
};
