import { useState, useEffect, useRef } from "react";
import { Award, Users, ShieldCheck, Wrench, Package, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ReactBits";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

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
    description: "Recognized for excellence across Jamshedpur & nearby neighborhoods"
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
  { 
    name: "Asian Paints", 
    tagline: "Color Partner",
    logo: "/asian%20paint.svg"
  },
  { 
    name: "Hafele", 
    tagline: "Hardware Expert",
    logo: "/Hafele.png"
  },
  { 
    name: "Godrej", 
    tagline: "Security Partner",
    logo: "/Godrej.svg"
  },
  { 
    name: "Philips", 
    tagline: "Lighting Partner",
    logo: "/philips.png"
  },
  { 
    name: "Hettich", 
    tagline: "Fittings Partner",
    logo: "/Hettich.svg"
  },
  { 
    name: "Jaquar", 
    tagline: "Bath Solutions",
    logo: "/Jaquar.svg"
  },
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

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-site-gold/40" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-site-gold font-bold">
              Why Choose Us
            </span>
            <div className="h-px w-8 bg-site-gold/40" />
          </div>

          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-white mb-6">
            Trust & <em className="not-italic text-site-gold">Credibility</em>
          </h2>

          <p className="text-white/40 text-sm leading-relaxed mt-4 max-w-xl mx-auto">
            We are committed to delivering exceptional precision, transparent operations, and timeless material quality in every space we touch.
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
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-site-crimson/60" />
            <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-site-crimson">
              Trusted Brand Partners
            </p>
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-site-crimson/60" />
          </div>

          {/* Marquee Container */}
          <div className="relative overflow-hidden py-10">
            {/* Gradient Masks - matched to section background */}
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Marquee Track */}
            <div className="flex animate-marquee items-center">
              {[...brandPartners, ...brandPartners, ...brandPartners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex flex-col items-center justify-center gap-2 px-6 md:px-8 mx-2 md:mx-3 group"
                >
                  <div className="h-14 md:h-20 w-36 md:w-56 flex items-center justify-center mb-1">
                    <Image 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="w-full h-full"
                      imageClassName="object-contain transition-all duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-105 filter brightness-110 contrast-110"
                      width={224}
                      height={80}
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white text-sm md:text-base tracking-tight mb-0.5">{partner.name}</span>
                    <span className="block text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">{partner.tagline}</span>
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
