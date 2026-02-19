import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/site-content";
import { ServicesHorizontalScroll } from "./services/ServicesHorizontalScroll";

const Services = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="services" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(0_0%_10%)_0%,hsl(0_0%_0%)_100%)] z-0" />

      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-wine-500/20 to-transparent z-[1]" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-wine-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 border-b-2 border-primary/30 pb-2">
            What We Offer
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4">
            Our Design <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
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

                  <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                    <div className="mb-4 w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <span className="text-primary font-mono text-[10px] tracking-widest uppercase mb-1 block">
                        0{index + 1}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white mb-2">
                        {category.title}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center text-white font-medium text-xs">
                      <span className="border-b border-primary pb-0.5">Explore</span>
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop View: Horizontal Scroll Pinned Section */}
        <div className="hidden md:block -mx-[calc(50vw-50%)]">
          <ServicesHorizontalScroll />
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/services">
            <button className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group hover:bg-wine-600 active:bg-wine-700">
              View Full Overview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;

