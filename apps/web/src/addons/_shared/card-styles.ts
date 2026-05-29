/* ═══════════════════════════════════════════════
   Shared selectable-card recipe
   Used across both Estimator step components and
   any Discovery selection surfaces. Single source
   of truth for "this is how a clickable option looks".
   ═══════════════════════════════════════════════ */

/** Base classes — applied to every selectable card regardless of state */
export const CARD_BASE =
    "bg-[#0a0a0a]/90 border border-white/[0.06] rounded-[8px] transition-all duration-300 relative overflow-hidden";

/** Idle hover treatment — gentle accent reveal */
export const CARD_HOVER = "hover:border-site-gold/45 hover:bg-[#0c0c0c]/90 cursor-pointer";

/**
 * Selected-state recipe — unified scale + accent border + soft tint.
 * The breathing glow shadow is added separately via `<BreathingGlow />`-style
 * absolute overlay so it can pulse without conflicting with the entry-stagger
 * variants on the button itself.
 */
export const CARD_SELECTED =
    "bg-[rgba(209,175,110,0.08)] border-site-gold scale-[1.02] shadow-[0_4px_24px_rgba(209,175,110,0.22)] z-10 cursor-pointer";

/**
 * Returns the full class string for a selectable card based on selection state.
 * Pass `extra` for layout-specific additions (padding, grid spans, etc.).
 *
 * @example
 *   <motion.button className={selectableCardClass(isSelected, "p-5 text-center")}>
 */
export function selectableCardClass(selected: boolean, extra = ""): string {
    return [CARD_BASE, selected ? CARD_SELECTED : CARD_HOVER, extra]
        .filter(Boolean)
        .join(" ");
}

/** Standard tactile feedback — apply to every selectable card via spread */
export const CARD_INTERACTIONS = {
    whileHover: { y: -2, scale: 1.015, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
    whileTap: { scale: 0.96, transition: { duration: 0.1 } },
} as const;

/**
 * Reduced-motion safe variant — no scale/translate, only opacity.
 * Use when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true.
 */
export const CARD_INTERACTIONS_REDUCED = {
    whileHover: { opacity: 0.85, transition: { duration: 0.15 } },
    whileTap: { opacity: 0.7, transition: { duration: 0.05 } },
} as const;

/**
 * Stagger-children animation for a grid/list of cards entering on step mount.
 *   <motion.div variants={cardListContainer} initial="hidden" animate="show">
 *     {items.map(item => <motion.button variants={cardListItem} ... />)}
 */
export const cardListContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
        },
    },
};

export const cardListItem = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
};

/**
 * Breathing-glow animation for the selected card — applied to an absolute
 * overlay element inside the card so it doesn't conflict with the card's
 * own stagger/hover/tap animations.
 *
 * @example
 *   <motion.button ...>
 *     {selected && (
 *       <motion.span
 *         aria-hidden="true"
 *         className="absolute inset-0 pointer-events-none"
 *         animate={breathingAnimation}
 *         transition={breathingTransition}
 *       />
 *     )}
 *   </motion.button>
 */
export const breathingAnimation = {
    boxShadow: [
        "0 0 24px -4px rgba(209,175,110,0.18)",
        "0 0 36px 0px rgba(209,175,110,0.40)",
        "0 0 24px -4px rgba(209,175,110,0.18)",
    ],
};

export const breathingTransition = {
    duration: 2.8,
    repeat: Infinity,
    ease: "easeInOut" as const,
};

/* ═══════════════════════════════════════════════
   LIGHT-MODE variant — Cream-Sage palette
   Used by Cost Estimator steps (light bg #faf8f5).
   Discovery quiz stages continue to use the dark
   variants above.
   ═══════════════════════════════════════════════ */

/** Light base — white glass card on cream background */
export const CARD_BASE_LIGHT =
    "bg-white/85 backdrop-blur-md border border-[#1a1a1a]/[0.06] rounded-[8px] transition-all duration-300 relative overflow-hidden";

/** Light idle hover — warm sage accent reveal */
export const CARD_HOVER_LIGHT =
    "hover:border-[#8b6f47]/50 hover:bg-white/95 hover:shadow-[0_4px_16px_rgba(139,111,71,0.08)] cursor-pointer";

/** Light selected — sage gold tint with distinct border + lift */
export const CARD_SELECTED_LIGHT =
    "bg-[#8b6f47]/[0.12] border-[#8b6f47] ring-1 ring-[#8b6f47] scale-[1.02] shadow-[0_4px_24px_rgba(139,111,71,0.22)] z-10 cursor-pointer";

/**
 * Light-mode version of selectableCardClass.
 * Drop-in replacement for estimator step components.
 */
export function selectableCardClassLight(selected: boolean, extra = ""): string {
    return [CARD_BASE_LIGHT, selected ? CARD_SELECTED_LIGHT : CARD_HOVER_LIGHT, extra]
        .filter(Boolean)
        .join(" ");
}

/** Light breathing glow — warm sage instead of bright gold */
export const breathingAnimationLight = {
    boxShadow: [
        "0 0 20px -4px rgba(139,111,71,0.12)",
        "0 0 32px 0px rgba(139,111,71,0.28)",
        "0 0 20px -4px rgba(139,111,71,0.12)",
    ],
};

export const breathingTransitionLight = {
    duration: 3.0,
    repeat: Infinity,
    ease: "easeInOut" as const,
};
