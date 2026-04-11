import { useRef } from "react";
import { ArrowUpRight, MapPin, Building2, Clock, Sparkles } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { KineticText } from "../ui/kinetic-text";
import { Button } from "../ui/button";

const trustPoints = [
  { text: "Reply within 24 hours", icon: Clock },
  { text: "Jamshedpur and Kolkata projects", icon: MapPin },
  { text: "Residential and commercial spaces", icon: Building2 },
];

const ContactHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={containerRef}
      className="home-section-frame relative flex min-h-[72vh] items-center overflow-hidden border-b border-white/5 pt-32 pb-20 md:pt-36 md:pb-24"
    >
      {/* --- ATMOSPHERE & BACKGROUND --- */}
      <div className="absolute inset-0 z-0 bg-[#030303] overflow-hidden">
        {/* Grain Noise Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-20" 
          style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
        />
        
        {/* Top-down elegance light beam */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] md:w-[80%] max-w-[1400px] h-[500px] md:h-[800px] opacity-40 blur-[100px] md:blur-[140px] pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse at top, rgba(209, 175, 110, 0.25) 0%, transparent 70%)" }} 
        />

        {/* Dynamic moving orbs */}
        <motion.div
          className="absolute left-[-10%] top-[10%] h-[32rem] w-[32rem] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(209, 175, 110, 0.4) 0%, transparent 72%)",
          }}
          animate={{
            x: prefersReducedMotion ? 0 : [-20, 40, -20],
            y: prefersReducedMotion ? 0 : [-20, -50, -20],
            scale: prefersReducedMotion ? 1 : [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[0%] h-[28rem] w-[28rem] rounded-full opacity-15 blur-[100px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(214, 174, 92, 0.25) 0%, transparent 68%)",
          }}
          animate={{
            x: prefersReducedMotion ? 0 : [0, -40, 0],
            y: prefersReducedMotion ? 0 : [0, 40, 0],
            scale: prefersReducedMotion ? 1 : [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Depth gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#000000] z-10" />
      </div>

      <div className="container relative z-30 mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-[#d1af6e4d] bg-[#d1af6e1A] px-6 py-2 backdrop-blur-sm text-xs font-medium uppercase tracking-[0.2em] text-[#d1af6e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d1af6e] animate-pulse" />
              Contact Cross Angle Interior
            </span>
          </motion.div>

          <div className="mb-8 space-y-2 px-2">
            <KineticText
              as="h1"
              preset={prefersReducedMotion ? "fade-up" : "word-reveal"}
              stagger={0.05}
              duration={0.9}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mx-auto max-w-5xl text-center text-white leading-[1.1]"
            >
              Start your project
            </KineticText>
            <KineticText
              as="div"
              preset={prefersReducedMotion ? "fade-up" : "word-reveal"}
              stagger={0.05}
              delay={0.14}
              duration={0.9}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mx-auto max-w-5xl text-center text-[#d1af6e] italic leading-[1.1]"
            >
              with clarity.
            </KineticText>
          </div>

          <motion.p
            className="mx-auto max-w-2xl text-base md:text-xl text-white/60 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            Tell us about your home, office, or renovation plan and we will guide
            you through scope, budget direction, and the clearest next step. No
            pressure. No hidden charges. Just a sharp starting point.
          </motion.p>

          <motion.div
            className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row relative z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.58, duration: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-b from-[#d1af6e] to-[#b89554] text-black border-none min-w-[260px] rounded-full px-10 py-7 text-sm font-bold uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(209,175,110,0.3),inset_0_1px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_50px_rgba(209,175,110,0.4),inset_0_1px_rgba(255,255,255,0.5)] group"
            >
              <a href="#contact" className="flex items-center justify-center">
                <span>Start Your Inquiry</span>
                <ArrowUpRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[260px] rounded-full border-white/10 bg-white/[0.03] backdrop-blur-md px-10 py-7 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:border-white/30 hover:bg-white/10 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
            >
              <a href="/estimate" className="flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-3 text-[#d1af6e]" />
                <span>Discovery Engine</span>
              </a>
            </Button>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-4 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.72, duration: 0.6 }}
          >
            {trustPoints.map((point) => (
              <div key={point.text} className="flex items-center gap-2 opacity-80 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <point.icon className="h-4 w-4 text-[#d1af6e]" />
                <span className="text-xs md:text-sm font-medium text-white/80">{point.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
