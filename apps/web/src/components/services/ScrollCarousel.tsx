import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/config/site-content";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const ScrollCarousel = () => {
    const sectionRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const cardRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

    console.log("ScrollCarousel render");

    useGSAP(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const trackEl = trackRef.current;
        const sectionEl = sectionRef.current;
        if (!trackEl || !sectionEl) return;

        const getScrollAmount = () => {
            const trackWidth = trackEl.scrollWidth;
            const viewportWidth = window.innerWidth;
            return -(trackWidth - viewportWidth + 300); // 300px extra to ensure last card shows completely and spacer kicks in
        };

        const tween = gsap.to(trackEl, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                id: "horiz",
                trigger: sectionEl,
                pin: true,
                pinSpacing: true,
                scrub: 1,
                start: "top top",
                end: () => `+=${Math.abs(getScrollAmount())}`,
                invalidateOnRefresh: true,
                anticipatePin: 1,
            },
        });

        // ── Per-card animations ────────────────────────
        cardRefs.current.forEach((card) => {
            if (!card) return;

            gsap.fromTo(
                card,
                {
                    scale: 0.85,
                    opacity: 0.6,
                    filter: "blur(4px)",
                    boxShadow: "0px 0px 0px 0px rgba(227, 83, 54, 0)"
                },
                {
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    boxShadow: "0px 0px 40px -10px rgba(227, 83, 54, 0.15)",
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: tween,
                        start: "left 85%",
                        end: "center center",
                        scrub: true,
                    },
                }
            );

            gsap.fromTo(
                card,
                {
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    boxShadow: "0px 0px 40px -10px rgba(227, 83, 54, 0.15)"
                },
                {
                    scale: 0.85,
                    opacity: 0.6,
                    filter: "blur(4px)",
                    boxShadow: "0px 0px 0px 0px rgba(227, 83, 54, 0)",
                    ease: "power2.in",
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: tween,
                        start: "center center",
                        end: "right 25%",
                        scrub: true,
                    },
                }
            );
        });
    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            className="relative h-screen bg-site-bg text-site-text flex flex-col lg:flex-row overflow-hidden w-full m-0"
        >
            {/* ── Left Fixed Content ── */}
            <div className="absolute top-0 left-0 w-full lg:relative lg:w-[480px] xl:w-[540px] h-auto lg:h-full flex flex-col justify-center px-8 lg:px-16 pt-24 lg:pt-0 z-20 shrink-0 bg-gradient-to-b lg:bg-gradient-to-r from-site-bg via-site-bg to-transparent lg:to-transparent pointer-events-none lg:pointer-events-auto">
                <div className="lg:pl-16">
                    <span className="text-site-crimson font-mono text-xs tracking-[0.2em] uppercase mb-4 block font-bold pointer-events-auto">
                        Our Expertise
                    </span>
                    <h2 className="font-serif text-5xl md:text-6xl xl:text-7xl font-bold mb-6 tracking-tight leading-[1.1] pointer-events-auto text-site-text-heading">
                        Design <br className="hidden lg:block" /> Disciplines
                    </h2>
                    <p className="text-site-text-muted text-base lg:text-lg leading-relaxed max-w-[400px] pointer-events-auto font-light">
                        Swipe through our specialized services. Each discipline is handled by dedicated experts ensuring perfection in every detail.
                    </p>
                </div>
            </div>


            {/* ── Right Scrolling Track ─────────────────────────────────────────── */}
            <div className="flex-1 h-screen flex items-end pb-12 lg:pb-0 lg:items-center relative z-10 w-full overflow-hidden" >
                {/* Track — slides left as section is pinned */}
                <div
                    ref={trackRef}
                    className="flex items-center gap-6 lg:gap-12 px-8 lg:pl-12 min-w-max"
                    style={{ willChange: "transform" }}
                >
                    {serviceCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={`/services/${category.slug}`}
                                ref={(el) => { cardRefs.current[index] = el; }}
                                className="group relative shrink-0 rounded-none overflow-hidden bg-site-bg-card border border-site-border shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                                style={{
                                    height: "clamp(400px, 65vh, 700px)",
                                    aspectRatio: "6 / 4",
                                    maxWidth: "85vw",
                                    willChange: "transform",
                                }}
                            >
                                {/* Background image */}
                                <div className="absolute inset-0 z-0 overflow-hidden bg-site-bg">
                                    <img
                                        src={category.heroImage}
                                        alt={category.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000 ease-out"
                                        loading="lazy"
                                    />
                                    {/* Gradient overlay for text legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>

                                {/* Top section: Icon and Number */}
                                <div className="absolute top-6 lg:top-10 left-6 lg:left-10 right-6 lg:right-10 z-10 flex justify-between items-start">
                                    {/* Strategic Icon box: wire-frame, no fill */}
                                    <div className="w-11 h-11 border border-[rgba(196,18,48,0.3)] flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-500 group-hover:border-[rgba(196,18,48,0.6)] group-hover:bg-site-crimson/10">
                                        <Icon className="w-5 h-5 text-site-crimson" strokeWidth={1.5} />
                                    </div>
                                    {/* Number eyebrow */}
                                    <span className="text-[10px] text-site-crimson/60 font-medium tracking-[0.3em] uppercase select-none">
                                        0{index + 1}
                                    </span>
                                </div>

                                {/* Bottom section: Title, Desc, Explore */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-10">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 tracking-tight drop-shadow-md">
                                            {category.title}
                                        </h3>
                                        <p className="text-white/70 text-sm lg:text-base line-clamp-2 mb-6 lg:mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-light pr-4">
                                            {category.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-site-crimson font-bold uppercase tracking-widest text-[10px] lg:text-xs">
                                            <span className="border-b-2 border-transparent group-hover:border-site-crimson pb-1 transition-colors duration-300">
                                                Explore
                                            </span>
                                            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300 text-site-crimson/50 group-hover:text-site-crimson" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Trailing spacer so last card can reach the center nicely */}
                    <div className="shrink-0 w-[50vw] lg:w-[40vw]" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
};
