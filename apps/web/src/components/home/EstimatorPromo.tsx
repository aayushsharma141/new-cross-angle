import { Calculator, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "../ui/enhanced/scroll-reveal";

export const EstimatorPromo = () => {
  return (
    <section className="py-section-y relative overflow-hidden bg-black text-white border-t border-white/5">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Left Column: Cost Copy */}
          <div className="lg:col-span-6">
            <ScrollReveal animation="slide-in-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">
                  Cost Transparency
                </span>
              </div>
              
              <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] tracking-tight text-white mb-6">
                Engineered for <br />
                <span className="text-primary italic">Predictability.</span>
              </h2>

              <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 font-light">
                Because interior design is an engineering challenge, costs should be calculated, not guessed. Use our digital cost estimator to build a detailed, line-item budget based on hard data.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  "Calculate budget by carpet area or BHK configuration",
                  "Compare Premium, Luxury, and Ultra-Luxury finish tiers",
                  "Receive an instant detailed cost breakdown for each room",
                  "Directly exports into a project scope ready for our team"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-white/70 font-light">
                    <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  to="/estimate"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap home-button-sweep group rounded-none h-14 px-8 md:px-10 uppercase tracking-[0.2em] text-[11px] font-bold transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-[0_4px_14px_hsla(var(--primary),0.3)] hover:shadow-[0_6px_20px_hsla(var(--primary),0.4)]"
                >
                  <span>Get Your Interior Investment Blueprint</span>
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Dynamic Mock Card */}
          <div className="lg:col-span-6">
            <ScrollReveal animation="slide-in-right" delay={0.2}>
              <div className="relative p-6 md:p-8 rounded-2xl bg-[#0a0a09] border border-white/[0.08] shadow-2xl relative overflow-hidden group">
                {/* Visual Glass highlights */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
                
                {/* Header info */}
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-base font-display">CrossAngle Calculator</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Dynamic Budget Preview</p>
                  </div>
                </div>

                {/* Mock input rows */}
                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white/50 tracking-wider">Property Size</span>
                      <span className="text-xs text-white/90 font-mono font-medium">3 BHK (~1,450 sq ft)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-primary rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white/50 tracking-wider">Quality Tier</span>
                      <span className="text-xs text-primary font-mono font-medium">Luxury Finish</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="py-2 text-center text-[10px] uppercase font-semibold border border-white/10 text-white/30 cursor-default">Premium</div>
                      <div className="py-2 text-center text-[10px] uppercase font-semibold border border-primary bg-primary/5 text-white cursor-default">Luxury</div>
                      <div className="py-2 text-center text-[10px] uppercase font-semibold border border-white/10 text-white/30 cursor-default">Ultra-Lux</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase text-white/40 tracking-widest mb-1">Estimated Budget</span>
                      <span className="text-2xl font-bold font-serif text-white tracking-wide">₹ 7.5L - 9.2L</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase text-white/40 tracking-widest mb-1">Guarantee</span>
                      <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5 justify-end">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 45 Days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/35 font-mono">
                    * Estimates based on Jamshedpur standard material indexes.
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EstimatorPromo;
