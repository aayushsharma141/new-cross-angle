import { ScrollReveal } from "../ui/enhanced/scroll-reveal";

export const Philosophy = () => {
  return (
    <section className="bg-neutral-950 py-section-y relative z-10 border-b border-white/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <ScrollReveal animation="slide-in-left" className="relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-none shadow-2xl group">
            <img 
              src="/reality_render.jpg" 
              alt="Engineering Interiors" 
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-neutral-950/0 transition-all duration-700"></div>
          </ScrollReveal>
          
          <ScrollReveal animation="slide-in-right" className="max-w-2xl">
            <span className="text-site-crimson font-mono text-[10px] uppercase tracking-[0.3em] mb-8 block">Signature Philosophy</span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-serif font-bold text-white leading-[1.2] tracking-tight">
              Most interior projects fail because they are treated as decoration projects.
            </h2>
            <div className="w-16 h-[2px] bg-site-gold my-10"></div>
            <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-serif text-white/60 leading-[1.3] italic font-light">
              We treat them as engineering projects.
            </h3>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
