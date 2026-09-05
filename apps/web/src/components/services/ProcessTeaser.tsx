import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProcessTeaser = () => {
  return (
    <section className="relative bg-[var(--s-canvas-secondary)] py-20 md:py-28 px-6 overflow-hidden border-y border-[var(--s-border-subtle)]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/20" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-primary" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Standard Operating Procedure</span>
            <div className="w-10 h-px bg-primary" />
          </div>
          
          <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] tracking-tight text-white mb-6 max-w-[850px]">
            Contractually Guaranteed Execution <br/> 
            <span className="italic font-light text-primary underline decoration-white/10 decoration-[3px] underline-offset-[10px]">Specifications &amp; Handover Standards</span>
          </h2>
          
          <p className="text-[1.05rem] text-white/60 font-light max-w-[58ch] leading-relaxed mb-10">
            Review the complete engineering milestones, material audit criteria, and zero-defect handover protocol that govern every Cross Angle site.
          </p>

          <Link
            to="/our-process"
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-white px-8 py-4 text-xs font-semibold tracking-[0.15em] text-black uppercase transition-all hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
          >
            Explore Complete Process Guide
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessTeaser;
