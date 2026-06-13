import { ScrollReveal } from "../ui/enhanced/scroll-reveal";
import { ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";

export const ProjectFailurePrevention = () => {
  return (
    <section className="py-24 bg-[#050505] text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-site-crimson/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-site-gold/3 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              The Safeguard
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Empathy Statement & Our Guarantees */}
          <div className="lg:col-span-6">
            <ScrollReveal animation="slide-in-left">
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-bold text-white mb-6 leading-[1.1] tracking-tight">
                Why Interior <br />
                <span className="text-site-crimson italic font-light serif">Projects Fail</span>
              </h2>

              <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg border-l-2 border-site-crimson pl-6">
                Most homeowners struggle with budget clarity, endless contractor delays, and decision fatigue. We designed our studio to eliminate all three.
              </p>

              {/* Guarantees list */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-site-crimson" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-display">45-Day Handover Guarantee</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-sm">We deliver on time or we pay you rent. No endless extensions.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-site-crimson" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-display">10-Year Modular Warranty</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-sm">On all modular kitchens and wardrobes manufactured in our factory.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-site-crimson" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-display">Factory-Calibrated Precision</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-sm">Zero sizing errors. All panels are cut on CNC machines before on-site handover.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Comparative Problem/Prevention Column */}
          <div className="lg:col-span-6 space-y-8 pt-4">
            <ScrollReveal animation="slide-in-right" delay={0.2}>
              <div className="space-y-8">
                {/* Issue 1 */}
                <div className="border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2 mb-2 text-white/40">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Vague Estimating</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2 font-display">Budget Overruns</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Standard contracts start with lowball quotes and escalate with hidden fees mid-project. We operate on fixed, itemized BOQs before a single nail is sourced.
                  </p>
                </div>

                {/* Issue 2 */}
                <div className="border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2 mb-2 text-white/40">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Uncoordinated Labor</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2 font-display">Endless Delays</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Unmanaged carpenters and supply chains push completions out by months. We run our projects on precise schedules synced directly with our modular manufacturing plant.
                  </p>
                </div>

                {/* Issue 3 */}
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-2 text-white/40">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Compromised Materials</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2 font-display">Cheap Material Swaps</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Vague scope sheets lead to counterfeit plywood, weak laminates, and low-grade hinges. We verify and stamp every board, drawer slide, and hinge in our workshop.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Quiet brand partners strip at the bottom */}
        <ScrollReveal animation="fade-up" delay={0.3}>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-mono">
              Engineered with certified fittings from
            </div>
            <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-40 hover:opacity-60 transition-opacity duration-300">
              <span className="text-sm font-sans tracking-[0.2em] font-bold">ASIAN PAINTS</span>
              <span className="text-sm font-sans tracking-[0.2em] font-bold">HAFELE</span>
              <span className="text-sm font-sans tracking-[0.2em] font-bold">GODREJ</span>
              <span className="text-sm font-sans tracking-[0.2em] font-bold">HETTICH</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ProjectFailurePrevention;
