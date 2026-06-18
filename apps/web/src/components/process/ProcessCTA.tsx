import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";

const ProcessCTA = () => {
  return (
    <section className="relative bg-stone-900 text-white border-t border-white/5 py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-800/30 via-stone-900 to-stone-900 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-site-gold block mb-8 font-medium">
            Start Your Journey
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-normal tracking-tight mb-6">
            Ready to Transform <span className="italic text-site-crimson font-light">Your Space?</span>
          </h2>
          <p className="text-stone-400 text-lg font-light max-w-2xl mx-auto mb-16 leading-relaxed">
            Whether you have a clear vision or are just exploring possibilities — we&apos;ll guide you through every step.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              to="/contact"
              className="group relative flex flex-col items-center gap-3 bg-white text-black px-8 py-8 rounded-2xl font-medium tracking-wide hover:bg-stone-200 hover:scale-[1.02] transition-all text-center"
            >
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-[0.1em]">Book Free Consultation</span>
              <span className="text-[10px] text-stone-500 font-light">No obligation · 30-minute call</span>
            </Link>

            <Link
              to="/estimate"
              className="group relative flex flex-col items-center gap-3 border border-white/20 text-white px-8 py-8 rounded-2xl font-medium tracking-wide hover:bg-white/5 hover:scale-[1.02] transition-all text-center"
            >
              <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-[0.1em]">Get Estimate</span>
              <span className="text-[10px] text-stone-500 font-light">Timeline + Budget Ranges</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessCTA;
