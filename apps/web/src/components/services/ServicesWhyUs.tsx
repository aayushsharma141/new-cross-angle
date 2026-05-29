import { motion } from "framer-motion";
import { Check, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Image } from "@/components/ui/enhanced/image";
import { cn } from "@/lib/utils";

const whyUsPoints = [
  { 
    title: "Single Point of Accountability",
    desc: "We own the entire vertical. No vendor ping-pong, no shifting blame.",
    icon: ShieldCheck 
  },
  { 
    title: "In-House Manufacturing",
    desc: "Custom precision fabrication that third-party vendors simply cannot match.",
    icon: Zap 
  },
  { 
    title: "Transparent Pricing Matrix",
    desc: "Real-time cost calibration ensures your budget is never a guessing game.",
    icon: BarChart3 
  }
];

const ServicesWhyUs = () => {
  return (
    <section className="relative bg-black py-24 lg:py-48 overflow-hidden px-6">
      {/* Aesthetic Background Detail */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-site-crimson/[0.03] to-transparent pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20 lg:gap-32">
        
        {/* Left Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-px bg-site-crimson" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-crimson">The Distinction</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-normal text-[clamp(2.5rem,5vw,5rem)] leading-[1.05] tracking-tight text-white mb-10"
          >
            <em className="italic text-site-crimson font-medium">Uncompromising</em><br />
            Standards in every joint.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[1.15rem] text-white/60 font-light leading-relaxed max-w-[48ch] mb-12"
          >
            We don’t just design spaces; we architect outcomes. Every material is vetted for multi-generational durability, and every delivery is backed by contract.
          </motion.p>

          <div className="space-y-8">
            {whyUsPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-6 group"
                >
                  <div className="mt-1 w-10 h-10 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center text-site-crimson group-hover:bg-site-crimson group-hover:text-white transition-all duration-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[13px] tracking-wide uppercase mb-2 group-hover:text-site-crimson transition-colors">{point.title}</h3>
                    <p className="text-white/60 text-[0.95rem] font-light leading-relaxed group-hover:text-white/60 transition-colors">{point.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Image: Magnetic Depth */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative"
        >
          {/* Decorative Ring */}
          <div className="absolute -inset-10 border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute -inset-20 border border-white/[0.02] rounded-full pointer-events-none" />
          
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.08]">
            <Image
              src="/images/projects/discovery/visual-5.jpg" 
              alt="Why CrossAngle" 
              className="h-full w-full"
              imageClassName="grayscale-[0.4] brightness-[0.8] transition-all duration-1000 group-hover:scale-110"
              width={800}
              height={1000}
            />
            {/* Dynamic Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
               <div className="font-display italic text-2xl text-white mb-2">Zero Ambiguity.</div>
               <div className="text-[10px] uppercase tracking-widest text-white/60">Our commitment since day one.</div>
            </div>
          </div>

          {/* Floater Element */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-site-crimson rounded-full flex items-center justify-center text-white shadow-2xl z-20"
          >
            <div className="text-center">
              <div className="font-bold text-lg leading-tight">500+</div>
              <div className="text-[7px] uppercase tracking-tighter">Projects</div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesWhyUs;
