import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const AboutCTA = () => {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden border-t border-white/5 bg-black">
      {/* Subtle red glow top-right */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full opacity-[0.08] pointer-events-none"
           style={{ background: "radial-gradient(circle, var(--site-crimson, #d92b2b) 0%, transparent 70%)" }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025]"
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
             backgroundSize: "60px 60px",
           }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="w-12 h-px bg-site-crimson" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Ready to Execute</span>
        </motion.div>

        {/* Headline — execution, not emotional */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="font-serif text-[clamp(2.2rem,4.5vw,4.8rem)] font-normal text-white leading-[1.08] tracking-tight mb-5"
        >
          Your space is a project.
          <br />
          We deliver it as an{" "}
          <span className="text-site-crimson font-semibold">experience.</span>
        </motion.h2>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="text-[clamp(0.88rem,1vw,1rem)] text-muted-foreground leading-[1.8] max-w-[42ch] mx-auto mb-10"
        >
          Every project is delivered fully executed — not just designed.
          Schedule a consultation and let's define the scope of your next space.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact-us"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-site-crimson text-white text-[0.82rem] font-bold uppercase tracking-[0.18em] hover:bg-site-crimson/90 transition-colors duration-200"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          <a
            href="tel:+919304000000"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/10 text-white text-[0.82rem] font-bold uppercase tracking-[0.18em] hover:border-site-crimson/40 hover:text-site-crimson transition-colors duration-200"
          >
            <Phone className="w-4 h-4" />
            Call Us Now
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.36 }}
          className="mt-14 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {["Free Consultation", "500+ Projects Delivered", "100% Turnkey"].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/60 whitespace-nowrap">
              <div className="w-[4px] h-[4px] rounded-full bg-site-crimson shadow-[0_0_5px_rgba(217,43,43,0.7)]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA;
