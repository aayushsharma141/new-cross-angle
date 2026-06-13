import { ScrollReveal } from "../ui/enhanced/scroll-reveal";
import { Image } from "@/components/ui/enhanced/image";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-site-bg-section border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto relative z-10 px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          
          {/* Left Column: Founder Photo */}
          <div className="md:col-span-4 max-w-[280px] mx-auto md:mx-0">
            <ScrollReveal animation="slide-in-left">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-white/10 group">
                <Image 
                  src="/hero_reality_render_1775299733746.png" 
                  alt="Aayush Sharma | Founder" 
                  className="w-full h-full"
                  imageClassName="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-1000 ease-out" 
                  width={400}
                  height={530}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Short Note & Stats */}
          <div className="md:col-span-8">
            <ScrollReveal animation="slide-in-right" delay={0.15}>
              <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px] block mb-4">
                Founder Note
              </span>
              
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6 leading-snug tracking-tight">
                Design is an <span className="text-site-crimson italic font-light serif">engineering challenge</span>, not decoration.
              </h3>

              <p className="text-white/70 text-sm md:text-base leading-relaxed font-light mb-8">
                &ldquo;We believe interior design is more than selecting colors—it is a project management and execution challenge. I started CrossAngle to bring structure, on-time delivery, and absolute price transparency to Jamshedpur home interiors. Our team handles every measurement, factory calibration, and on-site handover so you can experience a seamless transformation.&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 font-mono">
                <span className="text-white font-semibold text-xs tracking-wider">Aayush Sharma</span>
                <span className="hidden sm:inline text-white/20">|</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">Founder, CrossAngle Studio</span>
              </div>

              {/* Inline stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-8 border-t border-white/5">
                <div>
                  <span className="block text-2xl font-serif font-bold text-white">15+</span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 mt-1 font-mono">Years Exp</span>
                </div>
                <div>
                  <span className="block text-2xl font-serif font-bold text-white">500+</span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 mt-1 font-mono">Happy Homes</span>
                </div>
                <div>
                  <span className="block text-2xl font-serif font-bold text-white">750+</span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 mt-1 font-mono">Projects Done</span>
                </div>
                <div>
                  <span className="block text-2xl font-serif font-bold text-white">10-Yr</span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 mt-1 font-mono">Warranty</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
