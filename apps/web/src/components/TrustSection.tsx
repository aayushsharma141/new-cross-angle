import { useState, useEffect, useRef } from "react";
import { Award, Users, ShieldCheck, Wrench, Package, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "./ReactBits";
import { motion } from "framer-motion";

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
    title: <span className="flex items-center"><CountUp to={500} duration={2} className="mr-1" />+ Happy Homes</span>,
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


      {/* Background is now clean bg-muted/5 with background/50 overlay as defined above */}

      <div className="container mx-auto px-4 relative z-10">
        {/* Stat Counter Band — 4 blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 mb-16 md:mb-20 border border-[rgba(237,234,230,0.08)]">
          {[
            { num: 14, suffix: "+", label: "YEARS EXPERIENCE", sub: "Crafting luxury interiors since 2011" },
            { num: 488, suffix: "+", label: "HAPPY CLIENTS", sub: "Trusted by families across India" },
            { num: 714, suffix: "+", label: "PROJECTS COMPLETED", sub: "Delivered with precision and care" },
            { num: 22, suffix: "+", label: "DESIGN AWARDS", sub: "Recognized for excellence in design" }
          ].map((stat, i) => (
            <div
              key={i}
              className={cn(
                "p-6 md:p-8 border-r border-b border-[rgba(237,234,230,0.08)]",
                "last:border-r-0 hover:border-[rgba(237,234,230,0.35)]",
                "transition-all duration-400 group",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex items-baseline gap-1">
                {stat.prefix && (
                  <span className="font-display text-2xl md:text-4xl font-light text-white">{stat.prefix}</span>
                )}
                <CountUp
                  to={stat.num}
                  duration={2.5}
                  className="font-display text-3xl md:text-5xl font-light text-white"
                />
                <span className="text-site-crimson font-display text-lg md:text-2xl font-light">{stat.suffix}</span>
              </div>
              <p className="text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase text-[#A3A09C] mt-2 md:mt-3">{stat.label}</p>
              <p className="text-[10px] text-[#6B6B6B] mt-1 hidden md:block">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="eyebrow justify-center">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4">
            Trust & <em>Credibility</em>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-base">
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
                  "p-5 md:p-6 rounded-xl bg-site-bg-card border border-site-border",
                  "hover:border-site-crimson/30 hover:bg-site-bg-card-hover",
                  "transition-all duration-500 group",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-site-crimson/20 transition-colors">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-site-crimson" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{item.description}</p>
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
          <p className="text-sm text-muted-foreground/80 mb-6 uppercase tracking-wider text-center">
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
