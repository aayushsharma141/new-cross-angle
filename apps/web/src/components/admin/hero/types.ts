export type AnimationEffect = "none" | "ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down" | "zoom-pan";

export interface HeroMediaItem {
    id: string;
    media_url: string;
    media_type: "video" | "image";
    title: string | null;
    headline: string | null;
    cta_text: string | null;
    cta_link: string | null;
    display_order: number;
    is_active: boolean;
    duration_ms: number;
    animation_effect: AnimationEffect;
    created_at: string;
    updated_at: string;
}

export const ANIMATION_EFFECTS: { value: AnimationEffect; label: string; description: string }[] = [
    { value: "none", label: "None", description: "Static display" },
    { value: "ken-burns-in", label: "Ken Burns — Zoom In", description: "Slow zoom into the image" },
    { value: "ken-burns-out", label: "Ken Burns — Zoom Out", description: "Starting zoomed, slowly pulling back" },
    { value: "pan-left", label: "Slow Pan Left", description: "Gentle horizontal pan to the left" },
    { value: "pan-right", label: "Slow Pan Right", description: "Gentle horizontal pan to the right" },
    { value: "pan-up", label: "Pan Up", description: "Cinematic upward movement with subtle scale" },
    { value: "pan-down", label: "Pan Down", description: "Cinematic downward movement with subtle scale" },
    { value: "zoom-pan", label: "Zoom Pan", description: "Diagonal drift with progressive zoom — premium feel" },
];
