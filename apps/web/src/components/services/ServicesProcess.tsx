import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    label: "Phase One",
    title: "Discovery & Free Consultation",
    description: "Deep dive into lifestyle requirements, brand identity, and structural constraints. We map the functional needs before touching the aesthetics.",
  },
  {
    number: "02",
    label: "Phase Two",
    title: "Strategic Concept",
    description: "Development of precise floor plans, material palettes, and 3D technical visualizations. You see the exact finishing before execution begins.",
  },
  {
    number: "03",
    label: "Phase Three",
    title: "Procurement & Manufacturing",
    description: "In-house fabrication combined with global sourcing. We handle all vendor coordination, quality checks, and logistics to ensure on-time availability.",
  },
  {
    number: "04",
    label: "Phase Four",
    title: "Turnkey Execution & Delivery",
    description: "On-site execution by specialist teams. Final styling, deep cleaning, and a definitive handover of a ready-to-use environment.",
  },
];

const ServicesProcess = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  return (
    <section ref={containerRef} className="relative bg-[#020202] py-24 lg:py-40 overflow-hidden px-6">
      {/* Structural Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/20" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 md:mb-32 border-b border-white/10 pb-12">
          <div className="max-w-[600px] mb-8 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-[1px] bg-site-crimson" />
              <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-crimson">The Methodology</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-white mb-6"
            >
              Borrowing Precision from <br/> <span className="italic font-medium text-site-crimson underline decoration-white/10 decoration-[4px] underline-offset-[12px]">Hospitality Standards.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[1rem] text-white/60 font-light max-w-[32ch] leading-relaxed md:text-right"
          >
            Refined over 500+ premium projects across India, ensuring no ambiguity from brief to handover.
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div className="max-w-[1000px] mx-auto">
          <div className="relative">
            
            {/* Vertical Line with Dynamic Progress */}
            <div className="absolute left-[30px] top-0 bottom-0 w-px bg-white/5 hidden sm:block">
              <motion.div 
                style={{ scaleY: lineHeight, originY: 0 }}
                className="w-full h-full bg-gradient-to-b from-site-crimson via-site-crimson to-transparent shadow-[0_0_20px_rgba(196,18,48,0.5)]"
              />
            </div>

            {/* Steps */}
            <div className="space-y-24 md:space-y-40">
              {steps.map((step, index) => (
                <div key={index} className="relative group sm:pl-24">
                  {/* Step Dot */}
                  <div className="absolute left-[24px] top-3 w-[14px] h-[14px] rounded-full bg-black border-[2px] border-site-crimson z-20 hidden sm:block">
                     <motion.div 
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className="absolute inset-0 bg-site-crimson rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     />
                  </div>

                  {/* Ghost Number Elevation */}
                  <div className="absolute right-0 -top-12 md:-top-20 font-display italic font-light text-[clamp(6rem,15vw,12rem)] leading-none text-white/[0.02] select-none pointer-events-none group-hover:text-site-crimson/[0.04] transition-colors duration-700">
                    {step.number}
                  </div>

                  {/* Content Overhaul */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ margin: "-100px" }}
                    className="relative z-10"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-bold text-[9px] tracking-[0.3em] uppercase text-site-crimson px-3 py-1 border border-site-crimson/30 rounded-full bg-site-crimson/5">{step.label}</span>
                    </div>
                    <div className="font-display italic text-[clamp(1.8rem,4vw,3rem)] font-normal text-white mb-6 group-hover:translate-x-2 transition-transform duration-500">
                      {step.title}
                    </div>
                    <p className="text-[1.1rem] text-white/60 leading-relaxed font-light max-w-[50ch] border-l border-white/10 pl-8 group-hover:border-site-crimson/50 transition-colors">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesProcess;
