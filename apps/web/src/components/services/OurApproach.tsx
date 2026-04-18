import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const OurApproach = () => {
  const pillars = [
    { num: "01", title: "Design Intelligence", desc: "Strategic spatial planning that prioritizes human behavior and workflow efficiency before aesthetics." },
    { num: "02", title: "Turnkey Execution", desc: "End-to-end management from procurement to final handover — ensuring zero friction for the client." },
    { num: "03", title: "Hospitality Detailing", desc: "Applying the rigorous standards of five-star luxury to residential and commercial environments." },
  ];

  return (
    <section className="relative bg-[#050505] border-y border-white/[0.05] overflow-hidden" style={{ padding: "clamp(100px,12vw,180px) clamp(20px,5vw,80px)" }}>
      {/* Background Aesthetic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(196,30,58,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-crimson">The Philosophy</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-normal text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.05] tracking-tighter text-white"
          >
            We Design. We Execute.<br />
            We Deliver <em className="italic text-site-crimson font-medium">Complete</em> Environments.
          </motion.h2>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 items-start gap-16 lg:gap-24">
          {/* Left Column */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[1.1rem] font-light text-white/40 leading-relaxed max-w-[48ch] mb-16"
            >
              End-to-end project handling from the first concept sketch to the final furniture arrangement. A single point of accountability for every decision, supplier, and deadline.
            </motion.p>

            <div className="flex flex-col space-y-0">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "group relative grid grid-cols-[60px_1fr] gap-8 py-10 transition-all duration-500 hover:bg-white/[0.02] px-4 -mx-4 rounded-xl",
                    i !== pillars.length - 1 && "border-b border-white/[0.05]"
                  )}
                >
                  <span className="font-display italic text-[1.75rem] text-site-crimson/40 group-hover:text-site-crimson transition-colors duration-500 pt-1">
                    {pillar.num}
                  </span>
                  <div>
                    <div className="font-bold text-[11px] tracking-[0.2em] uppercase mb-3 text-white">
                      {pillar.title}
                    </div>
                    <p className="text-[0.95rem] text-white/40 leading-relaxed font-light group-hover:text-white/60 transition-colors">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Data Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-[#0d0d0d] border border-white/[0.08] p-10 lg:p-16 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-site-crimson/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="font-bold text-[10px] tracking-[0.3em] uppercase text-site-crimson mb-12 flex items-center gap-3">
                  <div className="w-8 h-px bg-site-crimson" />
                  Performance Metrics
                </div>

                <div className="space-y-16">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="group"
                  >
                    <div className="font-display italic font-light text-[clamp(2.5rem,5vw,5rem)] leading-none text-white mb-2 group-hover:text-site-crimson transition-colors duration-500">₹2–20Cr+</div>
                    <div className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/30">Project Value Threshold</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group"
                  >
                    <div className="font-display italic font-light text-[clamp(2.5rem,5vw,5rem)] leading-none text-white mb-2 group-hover:text-site-crimson transition-colors duration-500">95%</div>
                    <div className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/30">Execution Fidelity Rate</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <div className="font-display italic font-light text-[clamp(1.8rem,3vw,3rem)] leading-none text-white mb-2 group-hover:text-site-crimson transition-colors duration-500">On-Time Delivery</div>
                    <div className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/30">Contractually Guaranteed</div>
                  </motion.div>
                </div>
              </div>

              <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between">
                <span className="text-white/20 text-[9px] uppercase tracking-widest">Global Sourcing • In-house Fab</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-site-crimson shadow-[0_0_8px_rgba(196,30,58,0.8)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurApproach;
