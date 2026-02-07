// Animation utilities and motion presets for Cross Angle Interior
// Based on UI/UX Design Document animation guidelines

import { Variants } from "framer-motion";

// Global animation settings
export const ANIMATION_DURATION = {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    stateLong: 0.5,
};

// Custom easing curve for smooth, premium feel
export const EASE_SMOOTH = "easeInOut";

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

// ============================================
// STAGGERED CHILDREN ANIMATIONS
// ============================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    },
};

// ============================================
// HOVER ANIMATIONS (for whileHover prop)
// ============================================

export const hoverLift = {
    y: -2,
    transition: { duration: ANIMATION_DURATION.fast, ease: EASE_SMOOTH }
};

export const hoverScale = {
    scale: 1.02,
    transition: { duration: ANIMATION_DURATION.fast, ease: EASE_SMOOTH }
};

export const hoverGlow = {
    boxShadow: "0 10px 40px -10px rgba(218, 165, 32, 0.3)",
    transition: { duration: ANIMATION_DURATION.fast, ease: EASE_SMOOTH }
};

// ============================================
// TAP ANIMATIONS (for whileTap prop)
// ============================================

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 }
};

// ============================================
// MODAL ANIMATIONS
// ============================================

export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: ANIMATION_DURATION.fast }
    },
    exit: {
        opacity: 0,
        transition: { duration: ANIMATION_DURATION.fast }
    }
};

export const modalContent: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: ANIMATION_DURATION.fast }
    }
};

// ============================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================

export const scrollFadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: ANIMATION_DURATION.slow, ease: EASE_SMOOTH }
};

// ============================================
// COUNT-UP ANIMATION HELPER (for stats)
// ============================================

export const countUpConfig = {
    duration: ANIMATION_DURATION.stateLong,
    ease: EASE_SMOOTH,
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideInFromLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

export const slideInFromRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: ANIMATION_DURATION.normal, ease: EASE_SMOOTH }
    },
};

// ============================================
// CARD HOVER PRESET
// ============================================

export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        transition: { duration: ANIMATION_DURATION.fast, ease: EASE_SMOOTH }
    }
};

// ============================================
// IMAGE HOVER (for portfolio/gallery)
// ============================================

export const imageHoverVariants: Variants = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.05,
        transition: { duration: ANIMATION_DURATION.slow, ease: EASE_SMOOTH }
    }
};

// ============================================
// REDUCED MOTION SUPPORT
// ============================================

/**
 * Check if user prefers reduced motion
 * Call this at component level, not inside render
 */
export const useReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns simplified variants when user prefers reduced motion
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.01 } },
            exit: { opacity: 0, transition: { duration: 0.01 } }
        };
    }
    return variants;
};

/**
 * Get motion props that respect reduced motion preference
 * Usage: <motion.div {...getMotionProps(fadeInUp)} />
 */
export const getMotionProps = (variants: Variants) => {
    const prefersReducedMotion = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.01 }
        };
    }

    return {
        variants,
        initial: "hidden",
        animate: "visible"
    };
};
