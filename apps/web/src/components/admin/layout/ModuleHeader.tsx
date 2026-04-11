import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface ModuleHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function ModuleHeader({ title, description, action }: ModuleHeaderProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Link to="/admin" className="text-[hsl(var(--admin-text-subtle))] hover:text-[hsl(var(--admin-primary))] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-px w-4 bg-[hsl(var(--admin-border))]" />
                    <span className="text-[10px] text-[hsl(var(--admin-primary))] uppercase tracking-widest font-medium">
                        CrossAngle OS
                    </span>
                </div>
                <h1 className="text-3xl font-serif text-[hsl(var(--admin-foreground))] tracking-tight">{title}</h1>
                {description && (
                    <p className="text-[hsl(var(--admin-text-muted))] text-sm mt-1 max-w-xl">{description}</p>
                )}
            </div>
            
            {action && (
                <div className="flex items-center gap-3">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
