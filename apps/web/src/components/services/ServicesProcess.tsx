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

  const rawLineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineHeight = useSpring(rawLineHeight, { stiffness: 100, damping: 30 });

  return (
    <section ref={containerRef} className="bg-[#030303] border-t border-white/10 overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-[14px] mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
          >
            <div className="w-10 h-[1px] bg-[#FF2A2A]" />
            Our Process
            <div className="w-10 h-[1px] bg-[#FF2A2A]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-normal text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED]"
          >
            <em className="italic text-[#FF2A2A]">How</em> We Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[0.93rem] text-[#EDEDED]/55 font-light max-w-[46ch] mx-auto mt-[18px] leading-[1.8]"
          >
            A four-stage methodology borrowed from hospitality industry standards and refined over 500+ projects across India.
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div className="max-w-[780px] mx-auto">
          <div className="relative mt-[60px]">
            
            {/* Vertical Line */}
            <div className="absolute left-[22px] top-0 bottom-8 w-[1px] bg-white/10 hidden sm:block">
              <motion.div 
                style={{ height: lineHeight }}
                className="w-full bg-[#FF2A2A] shadow-[0_0_12px_rgba(255,42,42,0.8)]"
              />
            </div>

            {/* Steps */}
            <div>
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative group ${index === steps.length - 1 ? 'pb-0' : 'pb-[60px]'} sm:pl-[76px]`}
                >
                  {/* Step Dot */}
                  <div className="absolute left-[16px] top-2 w-[14px] h-[14px] rounded-full bg-[#030303] border-[1.5px] border-[#FF2A2A] z-10 transition-all duration-350 ease-[timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#FF2A2A] group-hover:shadow-[0_0_16px_rgba(255,42,42,0.5)] hidden sm:block" />

                  {/* Ghost Number */}
                  <div className="absolute right-[-10px] -top-[22px] font-display italic font-light text-[clamp(4.5rem,9vw,7.5rem)] leading-none text-[#EDEDED]/[0.03] select-none pointer-events-none transition-colors duration-350 group-hover:text-[#FF2A2A]/[0.05]">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="font-label text-[8px] font-bold tracking-[0.22em] uppercase text-[#FF2A2A] mb-[7px]">
                      {step.label}
                    </div>
                    <div className="font-display italic text-[clamp(1.5rem,3vw,2.3rem)] font-normal text-[#EDEDED] mb-3">
                      {step.title}
                    </div>
                    <p className="text-[0.93rem] text-[#EDEDED]/55 leading-[1.75] font-light max-w-[46ch]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesProcess;
