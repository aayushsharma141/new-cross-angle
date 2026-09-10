"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SpotlightNavContainerProps {
    children: React.ReactNode;
    className?: string;
    activeIndex?: number;
}

export function SpotlightNavContainer({
    children,
    className,
    activeIndex = -1,
}: SpotlightNavContainerProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const [hoverX, setHoverX] = useState<number | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            // Direct update for immediate feedback
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    return (
        <div className={cn("relative flex justify-center", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "spotlight-nav navbar-pill",
                    "relative h-[50px] rounded-full transition-all duration-500 overflow-visible"
                )}
                style={{
                    ...((isDark
                        ? { "--spotlight-color": "rgba(255,255,255,0.15)", "--ambience-color": "#C9A85C" }
                        : { "--spotlight-color": "rgba(0,0,0,0.05)", "--ambience-color": "#C9A85C" }) as React.CSSProperties)
                }}
            >
                {/* Content */}
                <div className="relative flex items-center h-full px-2.5 xl:px-6 gap-0.5 lg:gap-1 xl:gap-3 z-[10]">
                    {children}
                </div>

                {/* LIGHTING LAYERS - Wrapped to prevent edge bleeding on rounded corners */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-[1]">
                    {/* 1. The Moving Spotlight (Follows Mouse) */}
                    <div
                        className="absolute bottom-0 left-0 w-full h-full opacity-0 transition-opacity duration-300"
                        style={{
                            opacity: hoverX !== null ? 1 : 0,
                            background: `
              radial-gradient(
                120px circle at var(--spotlight-x) 100%, 
                var(--spotlight-color, rgba(0,0,0,0.1)) 0%, 
                transparent 50%
              )
            `
                        }}
                    />

                    {/* 2. The Active State Ambience (Stays on Active) */}
                    <div
                        className="absolute bottom-0 left-0 w-full h-[2px] transition-opacity duration-300"
                        style={{
                            opacity: activeIndex === -1 ? 0 : 1,
                            background: `
                  radial-gradient(
                    60px circle at var(--ambience-x) 0%, 
                    var(--ambience-color, rgba(0,0,0,1)) 0%, 
                    transparent 100%
                  )
                `
                        }}
                    />
                </div>
            </nav>
        </div>
    );
}
