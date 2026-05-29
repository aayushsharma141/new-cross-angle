import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundSize: "128px 128px",
};

const GalleryCTA = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#080808]">
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={GRAIN_STYLE}
      />

      {/* Subtle gold glow (center) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] rounded-full bg-[#D1AF6E]/5 blur-[100px]" />
      </div>

      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1AF6E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
        {/* Overline */}
        <motion.p
          className="text-[9px] uppercase tracking-[0.4em] text-[#D1AF6E]/50 font-light mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Ready to Transform Your Space?
        </motion.p>

        {/* Gold rule */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="flex-1 max-w-[60px] h-px bg-[#D1AF6E]/20" />
          <span className="w-1.5 h-1.5 bg-[#D1AF6E]/40 rotate-45 flex-shrink-0" />
          <span className="flex-1 max-w-[60px] h-px bg-[#D1AF6E]/20" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Every great space starts
          <br />
          <span className="italic text-[#D1AF6E]">with a conversation.</span>
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-12 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Schedule a free consultation and let our expert designers craft spaces
          that reflect your life — not just a trend.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          {/* Primary: gold filled */}
          <Link to="/contact-us">
            <motion.button
              className="px-10 py-4 bg-[#D1AF6E] text-[#0a0a0a] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-[#D1AF6E]/90 transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D1AF6E]"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Book a Free Consultation
            </motion.button>
          </Link>

          {/* Secondary: outline */}
          <Link to="/portfolio">
            <motion.button
              className="px-10 py-4 border border-white/15 text-white/50 text-[11px] uppercase tracking-[0.3em] font-light hover:border-[#D1AF6E]/40 hover:text-white/80 transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Browse Portfolio
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {["Free Consultation", "Expert Designers", "100% Satisfaction"].map(
            (item) => (
              <span
                key={item}
                className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] text-white/25 font-light"
              >
                <span className="w-1 h-1 bg-[#D1AF6E]/40 rounded-full" />
                {item}
              </span>
            )
          )}
        </motion.div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1AF6E]/10 to-transparent" />
    </section>
  );
};

export default GalleryCTA;
