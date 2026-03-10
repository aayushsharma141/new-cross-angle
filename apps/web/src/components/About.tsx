import { Award, Users, Clock, Sparkles, ArrowRight, Check } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { Link } from "react-router-dom";
import { ScrollReveal } from "./ui/scroll-reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

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
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <stat.icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
        {count}{stat.suffix}
      </div>
      <div className="text-primary-foreground/60 text-xs md:text-sm font-medium uppercase tracking-wider mt-1">
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
      className="py-20 md:py-32 relative overflow-hidden bg-muted/5"
    >
      {/* Dark overlay matching hero */}
      <div className="absolute inset-0 bg-background/95 z-0" />

      {/* Decorative Background */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-wine-500/10 to-transparent z-[1]"
        style={{ y: backgroundY }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-wine-500/5 rounded-full blur-3xl z-[1]"
        style={{ y: circleY }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          {/* Horizontal Stats Bar */}
          <div className="mb-16">
            <div className="relative bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`
                      ${index % 2 !== 0 ? 'border-l border-white/5' : ''} 
                      ${index < 2 ? 'border-b border-white/5' : ''}
                      md:border-b-0
                      ${index > 0 ? 'md:border-l md:border-white/5' : 'md:border-l-0'}
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
              <span className="inline-block text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 border-b-2 border-primary/30 pb-2">
                About Us
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
                Creating Spaces <br />
                <span className="text-primary">That Inspire</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                Welcome to Cross Angle Interior—where we <span className="text-foreground font-semibold italic">architect anticipation</span>.
                Our studio is a sanctuary for visionary design, where every commission is treated as a silent curation of legacy.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                We believe true design transcends the ornamental. It is the <span className="text-primary font-medium">silent curator of experience</span>, crafting atmospheres that resonate with the soul and anticipate the future of living.
              </p>
            </ScrollReveal>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1} animation="fade-up">
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                      <Check className="w-3 h-3 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-foreground/90 text-sm md:text-base font-medium">{feature}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA Button */}
            <Link to="/about-us">
              <Button asChild className="group rounded-full px-6 md:px-8 py-3 md:py-4 h-auto text-base hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:bg-wine-600 active:bg-wine-700">
                <span>
                  Learn More About Us
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Visual Element */}
          <ScrollReveal animation="slide-in-right" delay={0.3} className="relative hidden lg:block">
            {/* Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-3xl transform rotate-3 z-0" />

            <div className="relative p-8 z-10">
              <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                    Award-Winning Design
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Recognized for excellence in interior design across Jharkhand and Kolkata.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="font-bold text-3xl">25+</span>
                    <span className="text-muted-foreground/80 text-sm">Awards Won</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl z-20">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <div>
                  <div className="font-bold text-lg">Certified</div>
                  <div className="text-primary-foreground/90 text-sm">Design Experts</div>
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
