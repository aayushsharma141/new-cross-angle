import { ScrollReveal } from "../ui/enhanced/scroll-reveal";

export const ProjectFailurePrevention = () => {
  return (
    <section className="py-section-y bg-[#050505] text-white relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto relative z-10 px-4 max-w-6xl">
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              The Safeguard
            </span>
            <div className="w-12 h-px bg-site-crimson" />
          </div>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-bold text-white leading-[1.1] tracking-tight">
            Why Projects <span className="text-site-crimson italic font-light serif">Fail</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {/* Issue 1 */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 relative group h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-crimson to-transparent opacity-50 transition-opacity" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-site-crimson/10 flex items-center justify-center">
                  <span className="text-site-crimson font-mono font-bold text-lg">01</span>
                </div>
                <h4 className="text-2xl font-bold text-white font-display">Budget Overruns</h4>
              </div>
              <p className="text-base text-white/60 leading-relaxed font-light mb-8">
                Standard contracts start with lowball quotes and escalate with hidden fees and "unforeseen" material costs mid-project.
              </p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold block mb-3">The CrossAngle Standard</span>
                <p className="text-sm text-white/90 leading-relaxed">
                  We operate on fixed, mathematically precise BOQs before a single nail is sourced. Zero hidden costs.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Issue 2 */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 relative group h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-crimson to-transparent opacity-50 transition-opacity" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-site-crimson/10 flex items-center justify-center">
                  <span className="text-site-crimson font-mono font-bold text-lg">02</span>
                </div>
                <h4 className="text-2xl font-bold text-white font-display">Endless Delays</h4>
              </div>
              <p className="text-base text-white/60 leading-relaxed font-light mb-8">
                Unmanaged supply chains and fragmented labor teams push completions out by months, leaving families stranded.
              </p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold block mb-3">The CrossAngle Standard</span>
                <p className="text-sm text-white/90 leading-relaxed">
                  Projects run on aggressive 45-day schedules synced directly with our modular manufacturing plant.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Issue 3 */}
          <ScrollReveal animation="fade-up" delay={0.3}>
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 relative group h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-crimson to-transparent opacity-50 transition-opacity" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-site-crimson/10 flex items-center justify-center">
                  <span className="text-site-crimson font-mono font-bold text-lg">03</span>
                </div>
                <h4 className="text-2xl font-bold text-white font-display">Cheap Materials</h4>
              </div>
              <p className="text-base text-white/60 leading-relaxed font-light mb-8">
                Vague scope sheets allow contractors to swap premium materials for counterfeit plywood and weak laminates behind your back.
              </p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold block mb-3">The CrossAngle Standard</span>
                <p className="text-sm text-white/90 leading-relaxed">
                  We verify, audit, and stamp every board, drawer slide, and hinge in our workshop before it enters your home.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Issue 4 */}
          <ScrollReveal animation="fade-up" delay={0.4}>
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 relative group h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-crimson to-transparent opacity-50 transition-opacity" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-site-crimson/10 flex items-center justify-center">
                  <span className="text-site-crimson font-mono font-bold text-lg">04</span>
                </div>
                <h4 className="text-2xl font-bold text-white font-display">Poor Supervision</h4>
              </div>
              <p className="text-base text-white/60 leading-relaxed font-light mb-8">
                Homeowners are forced to become project managers, visiting the site daily to beg carpenters to fix sloppy mistakes.
              </p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold block mb-3">The CrossAngle Standard</span>
                <p className="text-sm text-white/90 leading-relaxed">
                  Every site gets a dedicated engineer. We manage labor and quality control so you never have to micromanage.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ProjectFailurePrevention;
