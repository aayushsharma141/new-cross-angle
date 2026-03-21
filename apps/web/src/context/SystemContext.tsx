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

    const refreshHealth = useCallback(async () => {
        try {
            // Ping the DB with a minimal query
            const { error } = await supabase
                .from('leads')
                .select('id', { head: true, count: 'exact' });

            const dbOk = !error;

            setHealth({
                status: dbOk ? 'healthy' : 'degraded',
                database: dbOk ? 'connected' : 'disconnected',
                storage: 'available',
                api: 'online',
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
        <SystemContext.Provider value={{ health, refreshHealth, notifications, addNotification }}>
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
