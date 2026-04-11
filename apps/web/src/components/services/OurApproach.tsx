import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const OurApproach = () => {
  const pillars = [
    { num: "01", title: "Design Intelligence", desc: "Strategic spatial planning that prioritizes human behavior and workflow efficiency before aesthetics." },
    { num: "02", title: "Turnkey Execution", desc: "End-to-end management from procurement to final handover — ensuring zero friction for the client." },
    { num: "03", title: "Hospitality Detailing", desc: "Applying the rigorous standards of five-star luxury to residential and commercial environments." },
  ];

  return (
    <section className="bg-[#0A0A0A] border-y border-white/10 overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-[14px] mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
        >
          Our Approach
          <div className="w-10 h-[1px] bg-[#FF2A2A]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-normal text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED]"
        >
          We Design. We Execute.<br />
          We Deliver <em className="italic text-[#FF2A2A]">Complete</em> Environments.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display italic text-[clamp(1rem,1.8vw,1.3rem)] text-[#FF2A2A] font-light mt-4 mb-5"
        >
          Not Just Atmosphere — Full Turnkey Transformation.
        </motion.p>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-[52px] items-start" style={{ gap: "clamp(40px,6vw,96px)" }}>

          {/* Left Column */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[0.95rem] font-light text-[#EDEDED]/55 leading-[1.8] max-w-[44ch] mb-12"
            >
              End-to-end project handling from the first concept sketch to the final furniture arrangement. A single point of accountability for every decision, supplier, and deadline.
            </motion.p>

            <div className="flex flex-col">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid grid-cols-[52px_1fr] gap-5 py-[26px] border-b border-white/10 transition-all duration-350 ease-[timing-function:cubic-bezier(0.22,1,0.36,1)] hover:pl-2.5 ${i === 0 ? 'border-t border-white/10' : ''}`}
                >
                  <span className="font-display italic text-[1.5rem] text-[#FF2A2A] leading-none mt-1 cursor-default">
                    {pillar.num}
                  </span>
                  <div>
                    <div className="font-label text-[10px] font-bold tracking-[0.18em] uppercase mb-2 text-[#EDEDED]">
                      {pillar.title}
                    </div>
                    <p className="text-[0.88rem] text-[#EDEDED]/55 leading-[1.7] font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Data Card */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-[#0D0D0D] border border-white/10 overflow-hidden" style={{ padding: "clamp(32px,4vw,56px)" }}
          >
            {/* Top right red glow */}
            <div className="absolute -top-[60px] -right-[60px] w-[280px] h-[280px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,42,42,0.09) 0%, transparent 65%)" }} />

            {/* Grayscale background image */}
            <Image
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=75"
              alt="Architecture Background"
              className="pointer-events-none absolute inset-0 h-full w-full"
              imageClassName="opacity-[0.07] grayscale"
              width={800}
              height={640}
            />

            <div className="relative z-10">
              <div className="font-label text-[9px] font-bold tracking-[0.22em] uppercase text-[#FF2A2A] border-b border-white/10 pb-[18px] mb-8">
                Performance Indicators
              </div>

              <div className="mb-[28px]">
                <div className="font-display italic font-light text-[clamp(2.4rem,4.5vw,4.4rem)] leading-none text-[#EDEDED] mb-1.5">₹2–20Cr+</div>
                <div className="font-label text-[9px] font-semibold tracking-[0.2em] uppercase text-[#EDEDED]/55">Project Value Delivered</div>
              </div>

              <div className="w-10 h-[2px] bg-[#FF2A2A] my-7" />

              <div className="mb-[28px]">
                <div className="font-display italic font-light text-[clamp(2.4rem,4.5vw,4.4rem)] leading-none text-[#EDEDED] mb-1.5">95%</div>
                <div className="font-label text-[9px] font-semibold tracking-[0.2em] uppercase text-[#EDEDED]/55">Execution Match Rate</div>
              </div>

              <div className="w-10 h-[2px] bg-[#FF2A2A] my-7" />

              <div>
                <div className="font-display italic font-light text-[clamp(1.5rem,2.8vw,2.8rem)] leading-none text-[#EDEDED] mb-1.5 align-baseline">On-Time<br />Delivery</div>
                <div className="font-label text-[9px] font-semibold tracking-[0.2em] uppercase text-[#EDEDED]/55 mt-2">Focused & Guaranteed</div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default OurApproach;
