import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
    status: 'healthy' | 'degraded' | 'error';
    database: 'connected' | 'disconnected';
    storage: 'available' | 'full' | 'error';
    api: 'online' | 'offline';
    lastChecked: string;
}

interface SystemNotification {
    id: string;
    title: string;
    message?: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: string;
}

interface SystemContextType {
    health: SystemHealth;
    refreshHealth: () => void;
    notifications: SystemNotification[];
    addNotification: (note: SystemNotification) => void;
    maintenanceMode: boolean;
    setMaintenanceMode: (active: boolean) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider = ({ children }: { children: ReactNode }) => {
    const [health, setHealth] = useState<SystemHealth>({
        status: 'healthy',
        database: 'connected',
        storage: 'available',
        api: 'online',
        lastChecked: new Date().toISOString(),
    });

    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const refreshHealth = useCallback(async () => {
        try {
            // Probe 1: Database — minimal row count query
            const { error: dbError } = await supabase
                .from('leads')
                .select('id', { head: true, count: 'exact' });

            const dbOk = !dbError;

            // Probe 2: Edge function / API gateway — ping posthog-query with a no-op action
            // This tells us if Supabase edge functions (and by extension PostHog connectivity)
            // are reachable. A successful invocation (even empty results) means api is online.
            let apiOk = false;
            try {
                const { error: fnError } = await supabase.functions.invoke('posthog-query', {
                    body: { action: 'ping' },
                });
                // A 4xx/5xx edge function error is still "reachable"; only a network-level
                // throw means the gateway itself is down.
                apiOk = fnError?.message?.includes('FunctionsFetchError') !== true;
            } catch {
                apiOk = false;
            }

            setHealth({
                status: dbOk && apiOk ? 'healthy' : 'degraded',
                database: dbOk ? 'connected' : 'disconnected',
                storage: 'available',
                api: apiOk ? 'online' : 'offline',
                lastChecked: new Date().toISOString(),
            });
        } catch {
            setHealth(prev => ({
                ...prev,
                status: 'error',
                database: 'disconnected',
                api: 'offline',
                lastChecked: new Date().toISOString(),
            }));
        }
    }, []);


    const addNotification = (note: SystemNotification) => {
        setNotifications(prev => [note, ...prev]);
    };

    return (
        <SystemContext.Provider value={{ health, refreshHealth, notifications, addNotification, maintenanceMode, setMaintenanceMode }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (context === undefined) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
};
