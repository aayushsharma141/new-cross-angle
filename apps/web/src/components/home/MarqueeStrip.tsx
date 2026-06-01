import { ScrollVelocity } from "@/components/ReactBits/index";

export const MarqueeStrip = () => {
    const items = [
        "RESIDENTIAL DESIGN",
        "COMMERCIAL SPACES",
        "TURNKEY PROJECTS",
        "MODULAR SOLUTIONS",
        "LIGHTING DESIGN",
        "PREMIUM CONSULTATION",
        "BESPOKE ARCHITECTURE",
    ];

    // Build the marquee text with a clean, high-precision separator
    const marqueeText = items.join("     ✦     ");

    return (
        <div className="py-4 bg-[#050505] relative overflow-hidden border-y border-white/[0.08] z-20">
            {/* Precise edge gradient masks for a smooth, high-end fade out */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-10" />

            <ScrollVelocity
                texts={[marqueeText]}
                velocity={12}
                className="text-[#EDEAE6]/85 font-sans tracking-[0.25em] uppercase transition-all duration-300 hover:text-white cursor-default"
                scrollerClassName="!font-sans !text-[11px] md:!text-xs lg:!text-sm !font-bold !tracking-[0.25em] !leading-none drop-shadow-none"
            />
        </div>
    );
};
