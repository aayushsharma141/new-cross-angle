
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CinematicSectionProps {
    children: React.ReactNode;
    className?: string; // Additional classes for the container
    id?: string;
    backgroundImage?: string; // URL for the background image
    overlayOpacity?: number; // Opacity of the black overlay (0-1)
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
    children,
    className,
    id,
    backgroundImage,
    overlayOpacity = 0.6
}) => {
    return (
        <section
            id={id}
            className={cn(
                "relative h-screen w-full overflow-hidden flex items-center justify-center snap-center bg-black",
                className
            )}
        >
            {/* Background Layer */}
            {backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1.0 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="w-full h-full"
                    >
                        <img
                            src={backgroundImage}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: overlayOpacity }}
                    />
                </div>
            )}

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6">
                <div className="w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </section>
    );
};
