import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
    currentModule: string | null;
    setCurrentModule: (module: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [currentModule, setCurrentModule] = useState<string | null>(null);

    return (
        <AdminContext.Provider
            value={{
                currentModule,
                setCurrentModule
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
