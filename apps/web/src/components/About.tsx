import { Award, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { Link } from "react-router-dom";
import { ScrollReveal } from "./ui/scroll-reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DesignProcessVisual } from "./DesignProcessVisual";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
  { icon: Clock, value: 750, suffix: "+", label: "Projects Completed" },
  { icon: Sparkles, value: 25, suffix: "+", label: "Design Awards" },
];

const features = [
  "Bespoke Design Narrative",
  "Curated Material Palette",
  "Precision-Timed Execution",
  "Enduring Aftercare",
];

const StatCard = ({
  stat,
  index
}: {
  stat: typeof stats[0];
  index: number;
}) => {
  const { count, ref } = useCountUp(stat.value, { duration: 2000, delay: index * 150 });

  return (
    <div
      ref={ref}
      className="relative group py-6 md:py-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-site-crimson/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          <stat.icon className="w-6 h-6 text-site-crimson/50 group-hover:text-site-crimson transition-colors duration-300 relative z-10" />
        </div>
        
        <div className="relative">
          <div className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-site-text-heading group-hover:text-site-crimson transition-colors duration-500 tracking-tighter">
            {count}{stat.suffix}
          </div>
          <div className="absolute -bottom-2 left-0 w-0 h-px bg-site-crimson group-hover:w-full transition-all duration-700" />
        </div>

        <div className="text-site-text-muted text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mt-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {stat.label}
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-40 relative overflow-hidden bg-site-bg-section selection:bg-site-crimson/30"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] z-[1] pointer-events-none" />

      {/* Decorative Gradients */}
      <motion.div
        className="absolute -top-24 -right-24 w-[40rem] h-[40rem] bg-site-crimson/5 rounded-full blur-[120px] z-0"
        style={{ y: backgroundY }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-site-bg via-transparent to-transparent z-0" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Minimalist Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-b border-white/5 pb-12">
          {stats.map((stat, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 0.1}>
              <StatCard stat={stat} index={index} />
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Content Column */}
          <div className="lg:col-span-5 pt-8">
            <ScrollReveal animation="slide-in-left">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-site-crimson" />
                <span className="text-site-crimson font-bold uppercase tracking-[0.3em] text-[10px]">The Studio</span>
              </div>
              
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-site-text-heading mb-10 leading-[1.1] tracking-tight">
                Private Interiors, <br />
                <span className="text-site-crimson italic font-light serif">Crafted With Precision</span>
              </h2>

              <div className="space-y-6 text-site-text-muted text-base md:text-lg leading-relaxed font-light">
                <p>
                  We create bespoke homes shaped by architectural clarity, material depth, and a deeply personal understanding of how you want to live.
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-white/20" />
                  <p className="text-xs uppercase tracking-widest text-site-text-heading/60 font-semibold">
                    Curating legacies in premium residences since 2009.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Premium Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 my-12 py-10 border-y border-white/5">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1} animation="fade-up">
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="relative">
                      <div className="w-2 h-2 bg-site-crimson rotate-45 group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-site-crimson/50 blur-sm animate-pulse rounded-full" />
                    </div>
                    <span className="text-site-text/80 text-sm font-medium tracking-tight group-hover:text-site-text-heading transition-colors">{feature}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Action with floating effect */}
            <ScrollReveal animation="fade-up" delay={0.4}>
              <Link to="/about-us" className="inline-block group">
                <Button className="pl-0 pr-8 !h-auto py-4 bg-transparent hover:bg-transparent text-site-text-heading border-none shadow-none group relative overflow-hidden transition-all duration-500">
                  <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-xs">Request Private Consultation</span>
                  <div className="ml-4 w-10 h-10 border border-site-crimson/30 rounded-none flex items-center justify-center group-hover:bg-site-crimson group-hover:border-site-crimson transition-all duration-500 inline-flex group-hover:translate-x-2">
                    <ArrowRight className="w-4 h-4 text-site-crimson group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute bottom-4 left-0 w-0 h-px bg-site-crimson group-hover:w-[calc(100%-48px)] transition-all duration-700 delay-100" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>

          {/* Visual Canvas Column */}
          <div className="lg:col-span-7 relative h-full flex items-center justify-center">
            <ScrollReveal animation="slide-in-right" delay={0.3} className="w-full relative h-[500px] lg:h-[650px] group">
               <div className="absolute inset-0 z-10 border border-white/5 pointer-events-none group-hover:border-site-crimson/20 transition-colors duration-700" />
               <div className="absolute top-0 right-0 p-8 z-20 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 border-r border-t border-site-crimson/50" />
               </div>
               
               <div className="relative w-full h-full overflow-hidden bg-site-bg">
                 <img 
                   src="https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80&w=2000" 
                   alt="Elegant minimal interior" 
                   className="w-full h-full object-cover object-center grayscale-[0.3] contrast-110 brightness-90 group-hover:scale-105 transition-transform duration-[2.5s] ease-out"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-site-bg-section via-site-bg-section/20 to-transparent opacity-90" />
                 <div className="absolute inset-0 bg-site-bg/10 mix-blend-overlay" />
               </div>

               <div className="absolute bottom-0 left-0 bg-site-bg-section px-6 py-4 flex items-center gap-4 z-20">
                  <div className="w-8 h-px bg-site-crimson" />
                  <div className="text-[9px] uppercase tracking-[0.5em] text-site-text-heading/80 font-semibold whitespace-nowrap">
                    Material Sophistication
                  </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
