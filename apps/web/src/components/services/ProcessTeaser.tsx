import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProcessTeaser = () => {
  return (
    <section className="relative bg-[#020202] py-24 md:py-32 px-6 overflow-hidden">
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
            <div className="w-12 h-px bg-site-crimson" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Our Methodology</span>
            <div className="w-12 h-px bg-site-crimson" />
          </div>
          
          <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white mb-6 max-w-[800px]">
            The Turnkey Process We <br/> 
            <span className="italic font-medium text-site-crimson underline decoration-white/10 decoration-[4px] underline-offset-[12px]">Follow For Every Project</span>
          </h2>
          
          <p className="text-[1.1rem] text-white/60 font-light max-w-[60ch] leading-relaxed mb-12">
            Refined over premium projects, our contractually-guaranteed 5-Stage Turnkey Process ensures no ambiguity from the first brief to the final handover.
          </p>

          <Link
            to="/our-process"
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-[0.1em] text-black uppercase transition-all hover:bg-site-crimson hover:text-white"
          >
            Discover the 5-Stage Process
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessTeaser;
