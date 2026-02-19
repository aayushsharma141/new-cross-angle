import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/config/site-content";
import { useGSAP, gsap, ScrollTrigger } from "@/hooks/use-gsap";
import { cn } from "@/lib/utils";

// Make sure to register the plugin
gsap.registerPlugin(ScrollTrigger);

export const ServicesHorizontalScroll = () => {
    const container = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP((ctx) => {
        // Determine the total width of the scroll container
        // We scroll -100% * (items - 1) essentially
        const scrollWidth = container.current?.scrollWidth;
        const offset = scrollWidth ? -(scrollWidth - window.innerWidth) : 0;

        gsap.to(container.current, {
            x: offset,
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                scrub: 1,
                // The scroll end depends on the amount of horizontal scroll needed
                end: () => `+=${scrollWidth}`,
                invalidateOnRefresh: true,
                anticipatePin: 1,
            },
        });
    }, []);

    return (
        <section className="relative overflow-hidden bg-background" ref={triggerRef}>
            {/* 
        Container that gets pinned. 
        Need to ensure it has valid height for the content.
      */}
            <div className="h-screen flex items-center overflow-hidden">
                {/* The moving track */}
                <div
                    ref={container}
                    className="flex gap-12 px-4 md:px-20 min-w-max"
                >
                    {/* Intro Card */}
                    <div className="w-[80vw] md:w-[600px] h-[70vh] flex flex-col justify-center shrink-0">
                        <div className="max-w-xl">
                            <span className="text-primary font-mono text-sm tracking-widest uppercase mb-4 block">
                                Our Expertise
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
                                Design Disciplines
                            </h2>
                            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                                Swipe through our specialized services. Each discipline is handled by dedicated experts ensuring perfection in every detail.
                            </p>
                        </div>
                    </div>

                    {/* Service Cards */}
                    {serviceCategories.map((category, index) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.id}
                                to={`/services/${category.slug}`}
                                className="group relative w-[85vw] md:w-[500px] h-[70vh] shrink-0 rounded-[2rem] overflow-hidden border border-white/10 bg-card/5 transition-transform duration-500 hover:scale-[1.02]"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={category.heroImage}
                                        alt={category.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-between">
                                    {/* Top: Icon & Number */}
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-mono text-4xl text-white/10 font-bold">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    {/* Bottom: Text & Action */}
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                                            {category.title}
                                        </h3>
                                        <p className="text-white/70 text-base line-clamp-3 mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
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

                    {/* End Spacer */}
                    <div className="w-[10vw] shrink-0" />
                </div>
            </div>
        </section>
    );
};
