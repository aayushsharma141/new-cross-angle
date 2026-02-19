"use client";

import React, { useRef } from 'react';
import { useGSAP, gsap } from '@/hooks/use-gsap';

interface MagneticProps {
    children: React.ReactElement;
    strength?: number;
}

/**
 * Magnetic component that attracts its child element towards the cursor
 * within its bounding box. Provides a premium, interactive feel.
 */
export default function Magnetic({ children, strength = 0.5 }: MagneticProps) {
    const { scope } = useGSAP((_context) => {
        const container = scope.current;
        if (!container) return;

        // Use gsap.quickTo for smooth, high-performance updates
        const xTo = gsap.quickTo(container, "x", {
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });
        const yTo = gsap.quickTo(container, "y", {
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = container.getBoundingClientRect();

            // Calculate distance from center
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const x = clientX - centerX;
            const y = clientY - centerY;

            xTo(x * strength);
            yTo(y * strength);
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    // We wrap the child in a div and apply the movement to this wrapper
    // to avoid interfering with the child's own styling/ref.
    return (
        <div ref={scope} className="inline-block cursor-pointer">
            {children}
        </div>
    );
}
