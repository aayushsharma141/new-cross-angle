import { Award, Users, Clock, ArrowRight, Check, Sparkles } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { Link } from "react-router-dom";
import { ScrollReveal } from "./ui/scroll-reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { LogoAnimation } from "./LogoAnimation";

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
      className="text-center px-4 md:px-6 py-4"
    >
      <div className="flex items-center justify-center mb-2">
        <div className="w-10 h-10 bg-site-crimson/10 rounded-none flex items-center justify-center">
          <stat.icon className="w-5 h-5 text-site-crimson" />
        </div>
      </div>
      <div className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-site-crimson">
        {count}{stat.suffix}
      </div>
      <div className="text-site-text-muted text-xs md:text-sm font-medium uppercase tracking-widest mt-1">
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

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const circleY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 md:py-32 relative overflow-hidden bg-site-bg-section"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-site-bg-section z-0" />

      {/* Decorative Background */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-site-crimson/5 to-transparent z-[1]"
        style={{ y: backgroundY }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-site-crimson/3 rounded-full blur-3xl z-[1]"
        style={{ y: circleY }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          {/* Horizontal Stats Bar */}
          <div className="mb-16">
            <div className="relative bg-site-bg-card backdrop-blur-sm border border-site-border rounded-none overflow-hidden">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`
                      ${index % 2 !== 0 ? 'border-l border-site-border' : ''} 
                      ${index < 2 ? 'border-b border-site-border' : ''}
                      md:border-b-0
                      ${index > 0 ? 'md:border-l border-site-border' : 'md:border-l-0'}
                    `}
                  >
                    <StatCard stat={stat} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <ScrollReveal animation="slide-in-left">
              <span className="inline-block text-site-crimson font-medium tracking-[0.2em] uppercase text-sm mb-4 border-b-2 border-site-crimson/30 pb-2">
                About Us
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-site-text-heading mt-4 mb-6 leading-tight">
                Crafting Spaces <br />
                <span className="text-site-crimson italic">That Matter</span>
              </h2>
              <p className="text-site-text-muted text-base md:text-lg leading-relaxed mb-4">
                Welcome to Cross Angle Interior—where we <span className="text-site-dandelion font-semibold italic">transform visions into reality</span>.
                Our studio is dedicated to visionary design, where every home is a unique masterpiece of comfort and style.
              </p>
              <p className="text-site-text-muted text-base md:text-lg leading-relaxed mb-8">
                We believe true design goes beyond decoration. It’s about creating environments that improve your quality of life, 
                blending functionality with timeless aesthetics for modern living.
              </p>
            </ScrollReveal>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1} animation="fade-up">
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-site-crimson/10 flex items-center justify-center group-hover:bg-site-crimson transition-all duration-300">
                      <Check className="w-3 h-3 text-site-crimson group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-site-text/90 text-sm md:text-base font-medium">{feature}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA Button */}
            <Link to="/about-us">
              <Button variant="luxury" className="px-8 !h-auto py-4 font-semibold uppercase tracking-widest text-xs">
                Discover Our Story
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform inline-block" />
              </Button>
            </Link>
          </div>

          {/* Visual Element: LogoAnimation */}
          <ScrollReveal animation="slide-in-right" delay={0.3} className="relative hidden lg:flex justify-center items-center">
            <LogoAnimation size={400} />

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-site-crimson text-white px-6 py-4 rounded-none shadow-2xl z-20">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <div>
                  <div className="font-bold text-lg uppercase tracking-widest leading-none mb-1">Premier</div>
                  <div className="text-white/80 text-[10px] uppercase tracking-widest">Design Standard</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
