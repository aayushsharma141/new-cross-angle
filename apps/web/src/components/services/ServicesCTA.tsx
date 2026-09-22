import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";

const ServicesCTA = () => {
  const analytics = useAnalytics();
  return (
    <section className="relative bg-[var(--s-canvas-primary)] border-y border-[var(--s-border-subtle)] overflow-hidden" style={{ padding: "clamp(100px,15vw,180px) clamp(20px,5vw,80px)" }}>
      {/* Background Aesthetic: Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(209,175,110,0.06)_0%,transparent_70%)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[900px] mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="w-12 h-px bg-primary" />
          <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px]">Final Consultation</span>
        </motion.div>
        
        <h2 className="font-serif font-bold text-[clamp(2.5rem,6vw,4.8rem)] text-white mb-8 leading-[1.1] tracking-tight">
          Ready To Transform Your <span className="italic font-light text-primary underline decoration-white/10 decoration-[4px] underline-offset-8">Home Or Office?</span>
        </h2>
        
        <p className="text-[clamp(1rem,1.5vw,1.2rem)] text-white/50 leading-[1.8] font-light mb-14 max-w-[55ch] mx-auto">
          Book a private design audit with our intelligence team to calibrate your residential or commercial vision before the first brick is laid.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/contact-us"
            onClick={() => track(analytics, "cta_clicked", { ctaId: "services_start_project", destination: "/contact-us" })}
            className="home-button-sweep group relative inline-flex items-center justify-center h-[60px] px-10 bg-primary text-black font-bold tracking-[0.2em] uppercase text-[10px] rounded-full transition-all duration-500 hover:shadow-[0_20px_40px_rgba(209,175,110,0.3)] hover:opacity-90 overflow-hidden"
          >
            <span className="relative z-10 mr-3">Start Your Project</span>
            <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>

          <Link 
            to="/estimate"
            onClick={() => track(analytics, "estimate_path_selected", { pathId: "services_cta_view_pricing" })}
            className="home-button-sweep group inline-flex items-center justify-center h-[60px] px-10 border border-[var(--s-border-subtle)] text-white font-bold tracking-[0.2em] uppercase text-[10px] rounded-full transition-all duration-500 hover:bg-white hover:text-black"
          >
            <span>View Pricing</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default ServicesCTA;
