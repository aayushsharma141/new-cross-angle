import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/config/site-content";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ServicesHorizontalScroll = () => {
    const sectionRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const cardRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

    React.useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        // Let GSAP measure after fonts/images have laid out
        const ctx = gsap.context(() => {
            // ── Horizontal slide ──────────────────────────────────────────────────
            const trackEl = trackRef.current;
            const sectionEl = sectionRef.current;
            if (!trackEl || !sectionEl) return;

            const tween = gsap.to(trackEl, {
                x: () => -(trackEl.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    id: "horiz",
                    trigger: sectionEl,
                    pin: true,
                    scrub: 1,
                    end: () => `+=${trackEl.scrollWidth - window.innerWidth}`,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });

            const horizST = tween.scrollTrigger!;

            // ── Per-card zoom as each passes center ───────────────────────────────
            cardRefs.current.forEach((card) => {
                if (!card) return;

                // Zoom IN: right edge enters screen until card center hits viewport center
                gsap.fromTo(
                    card,
                    { scale: 0.82 },
                    {
                        scale: 1,
                        ease: "power1.out",
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: horizST,
                            start: "left 95%",
                            end: "center center",
                            scrub: true,
                        },
                    }
                );

                // Zoom OUT: center leaves viewport center until left edge exits
                gsap.fromTo(
                    card,
                    { scale: 1 },
                    {
                        scale: 0.82,
                        ease: "power1.in",
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: horizST,
                            start: "center center",
                            end: "right 5%",
                            scrub: true,
                        },
                    }
                );
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative bg-background"
        >
            {/* ── Static title — always centred at top, sits above pinned content ── */}
            <div
                className="absolute top-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center"
                style={{ paddingTop: "clamp(32px, 5vh, 64px)" }}
            >
                <span className="text-primary font-mono text-xs md:text-sm tracking-[0.25em] uppercase mb-3 opacity-80">
                    Our Expertise
                </span>
                <h2 className="font-serif text-4xl md:text-6xl font-bold text-center leading-tight">
                    Design Disciplines
                </h2>
            </div>

            {/* ── Full-screen viewport ─────────────────────────────────────────── */}
            <div className="h-screen flex items-center overflow-hidden">
                {/* Track — slides left as section is pinned */}
                <div
                    ref={trackRef}
                    className="flex items-center gap-8 px-[10vw] min-w-max"
                    style={{ willChange: "transform" }}
                >
                    {serviceCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={`/services/${category.slug}`}
                                ref={(el) => { cardRefs.current[index] = el; }}
                                /* 15:9 aspect ratio: width = height × (15/9) */
                                className="group relative shrink-0 rounded-[2rem] overflow-hidden border border-white/10"
                                style={{
                                    height: "clamp(300px, 60vh, 600px)",
                                    aspectRatio: "15 / 9",
                                    maxWidth: "85vw",
                                    willChange: "transform",
                                }}
                            >
                                {/* Background image */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img
                                        src={category.heroImage}
                                        alt={category.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                </div>

                                {/* Number badge */}
                                <span className="absolute top-6 right-8 font-mono text-5xl text-white/10 font-bold z-10 select-none">
                                    0{index + 1}
                                </span>

                                {/* Card content */}
                                <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-between">
                                    {/* Icon pill */}
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-500 self-start">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Text */}
                                    <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">
                                            {category.title}
                                        </h3>
                                        <p className="text-white/60 text-sm line-clamp-2 mb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            {category.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-white font-medium uppercase tracking-wider text-xs">
                                            <span className="border-b border-primary/50 group-hover:border-primary transition-colors pb-1">
                                                Explore
                                            </span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Trailing spacer so last card can reach center */}
                    <div className="shrink-0 w-[10vw]" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
};
