import { ScrollReveal } from "../ui/enhanced/scroll-reveal";

export const CredibilityStrip = () => {
  return (
    <div className="bg-neutral-950 py-8 border-t border-b border-white/5 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-wrap items-center justify-between gap-6 md:gap-12">
            <div className="text-center md:text-left flex-1 min-w-[140px]">
              <span className="block text-2xl md:text-3xl font-display font-semibold text-white">500+</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">Projects Delivered</span>
            </div>
            <div className="text-center md:text-left flex-1 min-w-[140px]">
              <span className="block text-2xl md:text-3xl font-display font-semibold text-white">15+</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">Years Experience</span>
            </div>
            <div className="text-center md:text-left flex-1 min-w-[140px]">
              <span className="block text-2xl md:text-3xl font-display font-semibold text-white">45-Day</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">Delivery Guarantee</span>
            </div>
            <div className="text-center md:text-left flex-1 min-w-[140px]">
              <span className="block text-2xl md:text-3xl font-display font-semibold text-white">10-Year</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">Material Warranty</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CredibilityStrip;
