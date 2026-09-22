import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Squares, FallingText } from "@/components/ReactBits/index";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const containerRef = useRef<HTMLElement>(null);
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  useScrollReveal(containerRef, ".reveal-elem");

  const highIntentServices = [
    {
      title: "Complete Home Interiors",
      href: "/services/residential",
      heroImage: services.find(s => s.slug === "living-room" || s.category_id === "residential")?.hero_image || "/reality_render.jpg"
    },
    {
      title: "Modular Kitchens",
      href: "/services/specialized/modular-kitchens",
      heroImage: services.find(s => s.slug === "modular-kitchens")?.hero_image || "/images/projects/discovery/reflect-env-kitchen.jpg"
    },
    {
      title: "Luxury Renovations",
      href: "/services/residential",
      heroImage: services.find(s => s.slug === "bedroom" || s.category_id === "residential")?.hero_image || "/images/projects/discovery/visual-3.jpg"
    },
    {
      title: "Commercial Spaces",
      href: "/services/commercial",
      heroImage: services.find(s => s.category_id === "commercial")?.hero_image || "/images/projects/discovery/visual-16.jpg"
    }
  ];

  const activeCategory = highIntentServices[hoveredIndex];

  return (
    <section id="services" ref={containerRef} className="py-section-y relative bg-black overflow-hidden flex flex-col justify-center">
      {/* Dark overlay & Squares pattern */}
      <Squares speed={0.06} opacity={0.04} />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-site-crimson/20 to-transparent z-[1]" />
      
      <div className="container mx-auto relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24 items-center min-h-[70vh]">
        
        {/* Left Column: Interactive List */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="reveal-elem flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-kiro-accent" />
            <span className="text-kiro-accent font-bold uppercase tracking-[0.3em] text-[10px]">Services</span>
          </div>
          <h2 className="reveal-elem font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-bold text-white mb-6 leading-[1.1] tracking-tight flex flex-col">
            <FallingText text="Engineered Interiors." delay={30} duration={0.6} />
            <em className="text-white/50 not-italic font-light">
              <FallingText text="Predictable Outcomes." delay={30} duration={0.6} />
            </em>
          </h2>

          {/* Neighborhood / area served callout */}
          <p className="reveal-elem text-white/35 text-xs tracking-[0.2em] uppercase font-medium mb-12 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-kiro-accent/60 flex-shrink-0" />
            Serving Jamshedpur · Kolkata · Mango · Bistupur · Sakchi · Adityapur
          </p>

          <div className="flex flex-col mb-10 w-full relative">
            {highIntentServices.map((serviceItem, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <Link
                  key={serviceItem.title}
                  to={serviceItem.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="reveal-elem group relative block py-6 border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className={cn("text-xs font-mono tracking-widest uppercase transition-colors duration-500", isHovered ? "text-kiro-accent" : "text-white/40")}>
                        0{index + 1}
                      </span>
                      <h3 className={cn("font-display text-[clamp(1.5rem,3vw,2.5rem)] transition-all duration-500 transform", isHovered ? "text-white translate-x-4" : "text-white/40")}>
                        {serviceItem.title}
                      </h3>
                    </div>
                    <ArrowRight className={cn("w-6 h-6 transition-all duration-500 transform", isHovered ? "text-kiro-accent -translate-x-2 opacity-100" : "text-white/20 -translate-x-8 opacity-0")} />
                  </div>
                  
                  {/* Subtle active underline indicator */}
                  <div className={cn("absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-site-crimson to-transparent transition-all duration-700 ease-out", isHovered ? "w-full opacity-100" : "w-0 opacity-0")} />
                </Link>
              );
            })}
          </div>

          <div className="reveal-elem mt-4">
            <Link to="/services" className="inline-block group">
              <Button className="pl-0 pr-8 !h-auto py-4 bg-transparent hover:bg-transparent text-white border-none shadow-none group relative overflow-hidden transition-all duration-500">
                <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-xs">Explore All Services</span>
                <div className="ml-4 w-10 h-10 border border-kiro-accent/30 rounded-none flex items-center justify-center group-hover:bg-kiro-accent group-hover:border-kiro-accent transition-all duration-500 inline-flex group-hover:translate-x-2">
                  <ArrowRight className="w-4 h-4 text-kiro-accent group-hover:text-white transition-colors" />
                </div>
                <div className="absolute bottom-4 left-0 w-0 h-px bg-kiro-accent group-hover:w-[calc(100%-48px)] transition-all duration-700 delay-100" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Dynamic Hover Image */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-[80vh] relative hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
              style={{ willChange: "transform, opacity" }}
            >
              <Image
                src={activeCategory?.heroImage}
                alt={activeCategory?.title}
                className="h-full w-full"
                width={900}
                height={1200}
              />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default Services;
