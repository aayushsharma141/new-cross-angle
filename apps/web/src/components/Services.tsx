import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/site-content";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {serviceCategories.map((category, index) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.id}
                to={`/services/${category.slug}`}
                className="block"
              >
                <article
                  className={cn(
                    "group relative bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-6 md:p-8",
                    "hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5",
                    "cursor-pointer h-full overflow-hidden"
                  )}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Number */}
                  <span className="absolute top-4 left-6 text-5xl font-serif font-bold text-foreground/5 group-hover:text-primary/10 transition-colors duration-500">
                    0{index + 1}
                  </span>

                  <div className="relative z-10 mt-6">
                    <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                      <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 group-hover:text-foreground/80 transition-colors">
                      {category.description}
                    </p>

                    <div className="flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      Explore {category.title}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
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

