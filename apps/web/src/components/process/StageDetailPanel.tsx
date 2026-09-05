import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, IndianRupee, User, HardHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const StageDetailPanel = () => {
  const { data: processStages = [] } = useQuery({
    queryKey: ['processStages'],
    queryFn: api.getProcessStages
  });
  const [activeIdx, setActiveIdx] = useState(0);

  if (processStages.length === 0) return null;

  const activeStage = processStages[activeIdx];

  return (
    <section className="relative bg-[#020202] py-24 lg:py-40 overflow-hidden px-6">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/20" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-white/10 pb-12">
          <div className="max-w-[950px] mb-8 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-px bg-kiro-accent" />
              <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-kiro-accent">The Methodology</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-white mb-6"
            >
              The Turnkey Process We <br/> <span className="italic font-medium text-kiro-accent underline decoration-white/10 decoration-[4px] underline-offset-[12px]">Follow For Every Project</span>
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

        {/* Stage Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12" role="tablist" aria-label="Process stages">
          {processStages.map((stage, idx) => (
            <button
              key={stage.id}
              type="button"
              role="tab"
              {...({ "aria-selected": activeIdx === idx })}
              tabIndex={activeIdx === idx ? 0 : -1}
              aria-controls={`stage-panel-${stage.id}`}
              id={`stage-tab-${stage.id}`}
              onClick={() => setActiveIdx(idx)}
              className={[
                "flex items-center gap-2 px-4 md:px-6 py-3 text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-full border",
                activeIdx === idx
                  ? "bg-kiro-accent text-white border-kiro-accent shadow-lg shadow-site-crimson/30"
                  : "bg-white/5 text-stone-400 border-white/10 hover:text-white hover:border-white/30"
              ].join(" ")}
            >
              <span className="font-mono text-[10px]">{stage.number}</span>
              <span className="hidden sm:inline">{stage.title}</span>
            </button>
          ))}
        </div>

        {/* Stage Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            role="tabpanel"
            aria-labelledby={`stage-tab-${activeStage.id}`}
            id={`stage-panel-${activeStage.id}`}
            className="grid lg:grid-cols-5 gap-8 lg:gap-12"
          >
            {/* Left — Image + Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img
                  src={activeStage.image}
                  alt={`${activeStage.title} stage`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading={activeIdx === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Clock className="w-3 h-3 text-kiro-accent" />
                  <span className="text-[10px] font-mono text-white tracking-wide">{activeStage.timeline}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <IndianRupee className="w-4 h-4 text-kiro-accent mb-2" />
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Investment</div>
                  <div className="text-xs font-medium text-white leading-snug">{activeStage.budgetRange}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-2" />
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Deliverable</div>
                  <div className="text-xs font-medium text-white leading-snug">{activeStage.deliverables[0]}</div>
                </div>
              </div>
            </div>

            {/* Right — Detail + Client/We split */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <span className="font-bold text-[9px] tracking-[0.3em] uppercase text-kiro-accent px-3 py-1 border border-kiro-accent/30 rounded-full bg-kiro-accent/5">
                  Stage {activeStage.number}
                </span>
                <h3 className="font-display italic text-[clamp(1.8rem,4vw,2.8rem)] font-normal text-white mt-4 mb-3">
                  {activeStage.title}
                </h3>
                <p className="text-[1.1rem] text-kiro-accent/80 font-light italic mb-4">{activeStage.subtitle}</p>
                <p className="text-[1rem] text-white/60 leading-relaxed font-light">{activeStage.detail}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-kiro-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">What you do</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeStage.clientDoes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-stone-400 font-light leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-kiro-accent/60 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <HardHat className="w-4 h-4 text-kiro-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">We handle</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeStage.weDo.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-stone-400 font-light leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-kiro-accent/60 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 block mb-3">You receive</span>
                <div className="flex flex-wrap gap-2">
                  {activeStage.deliverables.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono tracking-wider text-stone-300"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400/70" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default StageDetailPanel;
