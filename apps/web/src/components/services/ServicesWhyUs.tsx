import { motion } from "framer-motion";
import { Check } from "lucide-react";

const whyUsPoints = [
  "Single Point of Accountability",
  "In-House Manufacturing",
  "Transparent Pricing Matrix"
];

const ServicesWhyUs = () => {
  return (
    <section className="bg-[#000000] border-t border-white/10 overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center" style={{ gap: "clamp(40px,6vw,80px)" }}>
        
        {/* Left Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-[14px] mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
          >
            Why CrossAngle
            <div className="w-10 h-[1px] bg-[#FF2A2A]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-normal text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED] mb-6"
          >
            <em className="italic text-[#FF2A2A]">Uncompromising</em><br />
            Standards.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[0.93rem] text-[#EDEDED]/55 font-light leading-[1.7] max-w-[44ch]"
          >
            We don’t just design spaces; we engineer environments. Every material is vetted, every dimension is calculated, and every delivery is guaranteed.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 list-none p-0"
          >
            {whyUsPoints.map((point, index) => (
              <li key={index} className="text-[0.95rem] text-[#EDEDED] mb-4 flex items-center">
                <Check className="text-[#FF2A2A] mr-3 w-4 h-4" strokeWidth={3} />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right Image */}
        <motion.div
           initial={{ opacity: 0, y: 36 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px]">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=75" 
              alt="Why CrossAngle" 
              className="w-full h-full object-cover grayscale-[0.8] brightness-[0.8]"
            />
            {/* Red overlay gradient */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,42,42,0.1),transparent_60%)] pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesWhyUs;
