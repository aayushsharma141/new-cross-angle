import { Award, Users, Clock, Sparkles } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { ScrollReveal } from "../ui/enhanced/scroll-reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Image } from "@/components/ui/enhanced/image";

const stats = [
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
  { icon: Clock, value: 750, suffix: "+", label: "Projects Completed" },
  { icon: Sparkles, value: 25, suffix: "+", label: "Design Awards" },
];

const StatCard = ({
  stat,
  index
}: {
  stat: typeof stats[0];
  index: number;
}) => {
  const { count, ref } = useCountUp(stat.value, { duration: 2000, delay: index * 100 });

  return (
    <div
      ref={ref}
      className="relative group p-4 rounded-xl bg-[#0a0a0a]/80 border border-white/[0.04] backdrop-blur-md overflow-hidden transition-all duration-300 flex flex-col items-start w-full"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-site-crimson/5 rounded-full blur-[20px] pointer-events-none" />
      <div className="font-serif text-3xl font-bold text-white mb-1">
        {count}{stat.suffix}
      </div>
      <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
        {stat.label}
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
      className="py-20 md:py-24 relative overflow-hidden bg-site-bg-section"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] z-[1] pointer-events-none" />

      {/* Decorative Gradients */}
      <motion.div
        className="absolute -top-24 -right-24 w-[40rem] h-[40rem] bg-site-crimson/5 rounded-full blur-[120px] z-0"
        style={{ y: backgroundY }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-site-bg via-transparent to-transparent z-0" />

      <div className="container mx-auto relative z-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
          {/* Left Column: Founder Note & Stats */}
          <div className="lg:col-span-7 pt-4">
            <ScrollReveal animation="slide-in-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-site-crimson" />
                <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Founder Note</span>
              </div>
              
              <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-bold text-white mb-8 leading-[1.15] tracking-tight">
                Design is an <span className="text-site-crimson italic font-light serif">engineering challenge</span>, not decoration.
              </h2>

              <div className="space-y-6 text-white/70 text-sm md:text-base leading-relaxed font-light mb-10">
                <p>
                  &ldquo;I started CrossAngle because I saw too many homeowners getting burned by contractor delays, weak plywood swaps, and unexpected cost additions mid-project. High-ticket interior design should be a structured, stress-free journey, not a series of unpleasant surprises.&rdquo;
                </p>
                <p>
                  &ldquo;That is why we operate on transparent, factory-calibrated board cutting, fixed-price line-item contracts, and a penalty-backed 45-day handover schedule. We design to your real budget and stand by our execution for a decade.&rdquo;
                </p>
                <div className="pt-2 flex flex-col">
                  <span className="font-semibold text-white tracking-wider">Aayush Sharma</span>
                  <span className="text-xs text-site-gold uppercase tracking-widest font-medium mt-1">Founder, CrossAngle Studio</span>
                </div>
              </div>

              {/* Compact stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                {stats.map((stat, index) => (
                  <StatCard key={index} stat={stat} index={index} />
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Single photo */}
          <div className="lg:col-span-5 relative">
            <ScrollReveal animation="slide-in-right" delay={0.2} className="w-full relative h-[400px] lg:h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image 
                src="/hero_reality_render_1775299733746.png" 
                alt="Aayush Sharma | CrossAngle Studio Founder Note" 
                className="w-full h-full"
                imageClassName="object-cover object-center grayscale-[0.2] contrast-105 brightness-90 group-hover:scale-105 transition-transform duration-[2000ms] ease-out" 
                width={800}
                height={1000}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="w-6 h-px bg-site-crimson" />
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/80 font-mono">Precision Execution since 2009</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
