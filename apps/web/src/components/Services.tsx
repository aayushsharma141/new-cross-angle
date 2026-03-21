import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/site-content";
import { ScrollCarousel } from "./services/ScrollCarousel";
import { Squares } from "./ReactBits";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";

const Services = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useScrollReveal(containerRef, ".reveal-elem");

  return (
    <section id="services" ref={containerRef} className="py-20 md:py-32 relative bg-background overflow-hidden">
      {/* Dark overlay & Squares pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(0_0%_10%)_0%,hsl(0_0%_0%)_100%)] z-0" />
      <Squares speed={0.06} opacity={0.04} />

      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-wine-500/20 to-transparent z-[1]" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-wine-500/5 rounded-full blur-3xl z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="reveal-elem eyebrow justify-center mb-4">
            What We Offer
          </span>
          <h2 className="reveal-elem font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4">
            Design Is Emotional.{" "}
            <em>Investment Is Strategic.</em>
          </h2>
          <p className="reveal-elem text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            From concept to completion, we offer comprehensive interior design
            services tailored to bring your vision to life.
          </p>
        </div>

        {/* Mobile View: Vertical Stack */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {serviceCategories.map((category, index) => {
            // ... keep existing mapping logic ...
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="col-span-1 min-h-[300px]"
              >
                <Link
                  to={`/services/${category.slug}`}
                  className="block h-full group relative overflow-hidden rounded-3xl border border-white/10"
                >
                  <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110">
                    <img
                      src={category.heroImage}
                      alt={category.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                    <div className="mb-6 w-11 h-11 border border-site-crimson/30 flex items-center justify-center bg-black/20 backdrop-blur-sm group-hover:bg-site-crimson/10 transition-colors">
                      <Icon className="w-5 h-5 text-site-crimson group-hover:text-white transition-colors" />
                    </div>

                    <div>
                      <span className="text-site-crimson font-medium tracking-[0.2em] uppercase text-[10px] mb-2 block">
                        0{index + 1} // Intelligence Unit
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white mb-3">
                        {category.title}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center text-white/70 group-hover:text-white font-medium text-xs tracking-widest uppercase transition-colors">
                      <span className="border-b border-site-crimson/40 group-hover:border-site-crimson pb-1">Enter Unit</span>
                      <ArrowRight className="ml-3 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop View: Horizontal Scroll Pinned Section */}
        <div className="hidden md:block">
          <ScrollCarousel />
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/services">
            <Button asChild className="group rounded-full px-8 py-4 h-auto text-base hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:bg-wine-600 active:bg-wine-700">
              <span>
                View Full Overview
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;

