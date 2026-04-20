import { ScrollVelocity } from "@/components/ReactBits";

export const MarqueeStrip = () => {
    const items = [
        "RESIDENTIAL",
        "COMMERCIAL",
        "TURNKEY PROJECTS",
        "INTERIOR DESIGN",
        "MODULAR KITCHEN",
        "LIGHTING DESIGN",
        "CONSULTATION",
    ];

    // Build the marquee text with ✦ separators
    const marqueeText = items.join("  ✦  ");

    return (
        <div className="py-3 bg-[#0A0A0A] relative overflow-hidden border-y border-[rgba(196,18,48,0.15)] z-20">
            <ScrollVelocity
                texts={[marqueeText, marqueeText]}
                velocity={25}
                className="text-[rgba(196,18,48,0.55)] text-[11px] font-medium tracking-[0.18em] uppercase px-8"
            />
        </div>
    );
};
