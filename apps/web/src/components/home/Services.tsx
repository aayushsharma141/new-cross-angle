import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/site-content";
import { Squares } from "@/components/ReactBits/index";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const containerRef = useRef<HTMLElement>(null);
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  useScrollReveal(containerRef, ".reveal-elem");

  const categoriesWithMedia = serviceCategories.map((category) => ({
    ...category,
    heroImage:
      services.find((service) => service.category_id === category.id && service.hero_image)?.hero_image || "",
  }));

  const activeCategory = categoriesWithMedia[hoveredIndex];

  return (
    <section id="services" ref={containerRef} className="py-20 md:py-32 relative bg-black overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Dark overlay & Squares pattern */}
      <Squares speed={0.06} opacity={0.04} />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-site-crimson/20 to-transparent z-[1]" />
      
      <div className="container mx-auto px-4 md:px-12 relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24 items-center min-h-[70vh]">
        
        {/* Left Column: Interactive List */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <span className="reveal-elem text-site-crimson font-mono text-sm tracking-[0.3em] uppercase block mb-4">
            Services
          </span>
          <h2 className="reveal-elem font-display text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-site-gold block mb-2">Design Is Emotional.</span>
            <em className="text-white/50 not-italic">Investment Is Strategic.</em>
          </h2>

          {/* Neighborhood / area served callout */}
          <p className="reveal-elem text-white/35 text-xs tracking-[0.2em] uppercase font-medium mb-12 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-site-crimson/60 flex-shrink-0" />
            Serving Jamshedpur · Kolkata · Mango · Bistupur · Sakchi · Adityapur
          </p>

          <div className="flex flex-col mb-10 w-full relative">
            {categoriesWithMedia.map((category, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <Link
                  key={category.id}
                  to={`/services/${category.slug}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="reveal-elem group relative block py-6 border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-mono text-white/60 tracking-widest uppercase">
                        0{index + 1}
                      </span>
                      <h3 className={`font-display text-2xl md:text-3xl lg:text-4xl transition-colors duration-500 ${isHovered ? "text-white" : "text-white/50"}`}>
                        {category.title}
                      </h3>
                    </div>
                    <ArrowRight className={`w-6 h-6 transition-all duration-500 ${isHovered ? "text-site-crimson translate-x-2" : "text-white/20"}`} />
                  </div>
                  
                  {/* Subtle active underline indicator */}
                  <div className={`absolute bottom-0 left-0 h-[1px] bg-site-crimson transition-all duration-500 ${isHovered ? "w-full" : "w-0"}`} />
                </Link>
              );
            })}
          </div>

          <div className="reveal-elem">
            <Link to="/services">
              <Button asChild className="group bg-transparent border border-white/20 rounded-none px-8 py-6 h-auto text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all duration-500">
                <span>
                  Explore All Services
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
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
