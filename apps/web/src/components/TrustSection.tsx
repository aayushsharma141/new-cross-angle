import { useState, useEffect, useRef } from "react";
import { Award, Users, ShieldCheck, Wrench, Package, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: Award,
    title: "45-Day Delivery",
    description: "Or we pay you rent. Guaranteed on-time completion."
  },
  {
    icon: ShieldCheck,
    title: "10-Year Warranty",
    description: "On all modular products. Quality you can trust."
  },
  {
    icon: Users,
    title: "500+ Happy Homes",
    description: "Recognized for excellence across Jharkhand & Kolkata"
  },
  {
    icon: Wrench,
    title: "No Hidden Costs",
    description: "Transparent pricing with detailed BOQ from day one."
  },
  {
    icon: Package,
    title: "Factory Finish",
    description: "Precision manufacturing for modular kitchens & wardrobes."
  },
  {
    icon: HeadphonesIcon,
    title: "Post-Project Support",
    description: "1 year free maintenance service included."
  }
];

const brandPartners = [
  { name: "Asian Paints", tagline: "Color Partner" },
  { name: "Hafele", tagline: "Hardware Expert" },
  { name: "Godrej", tagline: "Security Partner" },
  { name: "Philips", tagline: "Lighting Partner" },
  { name: "Hettich", tagline: "Fittings Partner" },
  { name: "Jaquar", tagline: "Bath Solutions" },
];

const TrustSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="trust" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden bg-muted/5">
      {/* Blurred Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.05),transparent_50%)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--background)/0.5),transparent_50%)] z-0" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-primary text-sm uppercase tracking-[0.3em] font-medium">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mt-4">
            Trust & Credibility
          </h2>
          <p className="text-primary-foreground/60 mt-4 max-w-2xl mx-auto">
            We're committed to delivering excellence in every project
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={cn(
                  "p-5 md:p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10",
                  "hover:border-primary/30 hover:bg-primary-foreground/8",
                  "transition-all duration-500 group",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-1 md:mb-2 text-sm md:text-base">{item.title}</h3>
                <p className="text-xs md:text-sm text-primary-foreground/60">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Brand Partners - Slow Marquee */}
        <div
          className={cn(
            "transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "500ms" }}
        >
          <p className="text-sm text-primary-foreground/50 mb-6 uppercase tracking-wider text-center">
            Trusted Brand Partners
          </p>

          {/* Marquee Container */}
          <div className="relative overflow-hidden py-4">
            {/* Gradient Masks - matched to section background */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Marquee Track */}
            <div className="flex animate-marquee">
              {[...brandPartners, ...brandPartners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 mx-3 md:mx-4 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap min-w-[200px]"
                >
                  {/* Placeholder for Logo - Using colored initials/text for now as explicit logos needed */}
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <span className="text-black font-bold text-lg">{partner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-white text-base md:text-lg tracking-tight">{partner.name}</span>
                    <span className="block text-xs text-white/50 font-medium">{partner.tagline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
