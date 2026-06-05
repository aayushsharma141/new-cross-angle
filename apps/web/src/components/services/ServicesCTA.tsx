import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";

const ServicesCTA = () => {
  const analytics = useAnalytics();
  return (
    <section className="relative bg-[#050505] border-y border-white/[0.08] overflow-hidden" style={{ padding: "clamp(100px,15vw,200px) clamp(20px,5vw,80px)" }}>
      {/* Background Aesthetic: Crimson Nebula */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.08)_0%,transparent_70%)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-site-crimson/10 blur-[120px] rounded-full"
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
          <div className="w-12 h-px bg-site-crimson" />
          <span className="text-site-gold font-bold tracking-[0.4em] uppercase text-[10px]">Final Consultation</span>
        </motion.div>
        
        <h2 className="font-display font-normal text-[clamp(2.8rem,7vw,5.5rem)] text-white mb-8 leading-[1.1] tracking-tight">
          Ready to build your <span className="italic font-medium text-site-crimson underline decoration-site-crimson/30 decoration-[6px] underline-offset-8">legacy?</span>
        </h2>
        
        <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-white/50 leading-[1.8] font-light mb-14 max-w-[55ch] mx-auto">
          Book a private design audit with our intelligence team to calibrate your residential or commercial vision before the first brick is laid.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/contact-us"
            onClick={() => track(analytics, "cta_clicked", { ctaId: "services_start_project", destination: "/contact-us" })}
            className="group relative inline-flex items-center justify-center h-[64px] px-12 bg-site-crimson text-white font-bold tracking-[0.2em] uppercase text-[11px] rounded-full transition-all duration-500 hover:shadow-[0_20px_40px_rgba(196,18,48,0.4)] overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <span className="relative z-10 mr-3">Start Your Project</span>
            <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>

          <Link 
            to="/estimate"
            onClick={() => track(analytics, "estimate_path_selected", { pathId: "services_cta_view_pricing" })}
            className="group inline-flex items-center justify-center h-[64px] px-12 border border-white/20 text-white font-bold tracking-[0.2em] uppercase text-[11px] rounded-full transition-all duration-500 hover:bg-white hover:text-black"
          >
            <span>View Pricing</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default ServicesCTA;
