import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { type Project } from "@/lib/api";

interface ProjectSystemInActionProps {
  project: Project;
}

const ProjectSystemInAction = (_props: ProjectSystemInActionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const steps = [
    { week: "Week 01", name: "Discover", desc: "Identified core functional and emotional requirements to establish the architectural baseline." },
    { week: "Week 02-03", name: "Design", desc: "Created precise layouts, spatial flow mapping, and selected premium material boards." },
    { week: "Week 04", name: "Engineer", desc: "Engineered hidden utilities, HVAC integration, and custom cabinetry frameworks." },
    { week: "Week 05-06", name: "Execute", desc: `Execution completed seamlessly on site with strict quality control protocols.` },
    { week: "Week 07", name: "Deliver", desc: `Handed over on time with zero budget escalation and complete transparency.` }
  ];

  return (
    <section className="py-24 md:py-32 bg-neutral-950 relative" ref={containerRef}>
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-24">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-site-gold block mb-4">Methodology</span>
          <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal leading-[1.1]">
            Predictable Interior <span className="italic text-site-crimson font-light">System™</span>
          </h2>
        </div>

        <div className="relative">
          {/* Central Vertical Line (Background) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
          
          {/* Central Vertical Line (Fill) */}
          <motion.div 
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-site-gold md:-translate-x-1/2 origin-top"
            style={{ scaleY }}
          />

          <div className="flex flex-col gap-16 md:gap-24 relative z-10">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={step.name} className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Text Content */}
                  <div className={`pl-8 md:pl-0 w-full md:w-1/2 ${isEven ? 'md:pl-16 text-left' : 'md:pr-16 md:text-right'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8 }}
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-site-gold block mb-2">{step.week}</span>
                      <h3 className="text-xl md:text-2xl font-serif text-white mb-3">{step.name}</h3>
                      <p className="text-stone-400 font-light text-sm leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Node Dot */}
                  <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 w-3 h-3 rounded-full bg-neutral-950 border-2 border-site-gold transform -translate-x-[5px] md:-translate-x-1/2 mt-1 md:mt-0 md:-translate-y-1/2" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProjectSystemInAction;
