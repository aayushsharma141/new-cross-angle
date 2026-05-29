import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const ContactHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const analytics = useAnalytics();

  return (
    <section
      ref={containerRef}
      className="home-section-frame relative flex min-h-[72vh] items-center overflow-hidden border-b border-white/5 pt-32 pb-20 md:pt-36 md:pb-24"
    >
      {/* --- ATMOSPHERE & BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030303]" aria-hidden="true">
        {/* Grain Noise Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-20" 
          style={{ backgroundImage: 'url("/noise.svg")' }}
        />
        
        {/* Top-down elegance light beam */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] md:w-[80%] max-w-[1400px] h-[500px] md:h-[800px] opacity-40 blur-[100px] md:blur-[140px] pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse at top, rgba(209, 175, 110, 0.25) 0%, transparent 70%)" }} 
        />
        
        {/* Depth gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#000000] z-10" />
      </div>

      <div className="container relative z-30 mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-4 space-y-2 px-2 font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mx-auto max-w-5xl text-center leading-[1.1] text-white"
          >
            Plan Your Interior Project
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-2xl font-serif leading-relaxed text-[#d1af6e] md:text-4xl mb-8"
          >
            With Clarity & Execution Confidence.
          </motion.p>
          
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-2xl text-base font-light leading-relaxed text-zinc-400 md:text-xl"
          >
            We handle everything — from design to final handover.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 flex flex-col items-center justify-center text-center"
          >
             <span className="block text-[10px] md:text-xs font-semibold text-white/70 uppercase tracking-[0.2em] mb-8">
               500+ Projects Delivered • 15+ Years • End-to-End Turnkey
             </span>
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button onClick={() => {
                  track(analytics, "cta_clicked", { ctaId: "hero_start_project", destination: "#contact-form-section" });
                  document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
                }} className="w-full sm:w-auto bg-[#d1af6e] text-black hover:bg-[#b89554] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-[0.97]">
                  Start Your Project
                </button>
                <button onClick={() => {
                  track(analytics, "cta_clicked", { ctaId: "hero_whatsapp", destination: "whatsapp" });
                  window.location.href = `https://wa.me/917909041132?text=Hi!%20I'm%20interested%20in%20your%20interior%20design%20services.`;
                }} className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-[0.97]">
                  WhatsApp Connect
                </button>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactHero;
