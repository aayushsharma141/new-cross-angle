import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SignatureItem {
  label: string;
  quote: string;
  subtext: string;
  gradientFrom: string;
  gradientTo: string;
  num: string;
}

const signatures: SignatureItem[] = [
  {
    num: "01",
    label: "Light",
    quote: "We design for every hour of the day.",
    subtext:
      "Natural calibration, 2700K precision, and dusk-aware layering — where light becomes the soul of a room.",
    gradientFrom: "rgba(42, 37, 32, 0.95)",
    gradientTo: "rgba(10, 10, 10, 0.98)",
  },
  {
    num: "02",
    label: "Materiality",
    quote: "Texture tells the story before words do.",
    subtext:
      "Raw stone. Brushed oak. Aged brass. The materials we choose outlast trends — they define legacy.",
    gradientFrom: "rgba(31, 34, 37, 0.95)",
    gradientTo: "rgba(10, 10, 10, 0.98)",
  },
  {
    num: "03",
    label: "Spatial Flow",
    quote: "Movement is the invisible architecture.",
    subtext:
      "How a body navigates a room — the pauses, the views, the transitions — determines how a space truly feels.",
    gradientFrom: "rgba(37, 32, 31, 0.95)",
    gradientTo: "rgba(10, 10, 10, 0.98)",
  },
  {
    num: "04",
    label: "Craftsmanship",
    quote: "Details are what separate good from memorable.",
    subtext:
      "Flush joints. Concealed hinges. Custom joinery measured in millimetres. The invisible discipline that elevates everything.",
    gradientFrom: "rgba(32, 37, 32, 0.95)",
    gradientTo: "rgba(10, 10, 10, 0.98)",
  },
];

const SignaturePanel = ({
  item,
  index,
}: {
  item: SignatureItem;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center text-center overflow-hidden select-none"
      style={{ minHeight: "75vh" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${item.gradientFrom} 0%, ${item.gradientTo} 100%)`,
        }}
      />

      {/* Subtle grain layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Fine horizontal rule above (except first) */}
      {index > 0 && (
        <div className="absolute top-0 left-12 right-12 h-px bg-white/[0.06] z-10" />
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
        transition={{
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.1,
        }}
        className="relative z-10 max-w-2xl mx-auto px-8 py-16 space-y-7"
      >
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-white/25">
            {item.num}
          </span>
          <div className="w-8 h-px bg-site-gold/35" />
          <span className="font-bold text-[10px] tracking-[0.28em] uppercase text-site-gold">
            {item.label}
          </span>
          <div className="w-8 h-px bg-site-gold/35" />
        </div>

        {/* Quote */}
        <blockquote
          className="font-serif font-light text-[#FAFAFA] leading-[1.35] tracking-tight"
          style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>

        {/* Subtext */}
        <p
          className="font-light text-white/40 leading-relaxed mx-auto"
          style={{
            fontSize: "clamp(13px, 1.4vw, 15px)",
            maxWidth: "420px",
          }}
        >
          {item.subtext}
        </p>
      </motion.div>
    </div>
  );
};

export const DesignSignatures = () => {
  return (
    <section
      className="bg-[#0A0A0A] relative"
      aria-label="Design Signatures"
    >
      {/* Section eyebrow header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-site-gold/40" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
            05 / DESIGN SIGNATURES
          </span>
        </div>
        <h2 className="mt-6 text-4xl md:text-5xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight max-w-md">
          Four Pillars of{" "}
          <span className="italic text-stone-400 font-light">Quiet</span>{" "}
          Design
        </h2>
      </div>

      {/* Signature Panels */}
      <div>
        {signatures.map((item, i) => (
          <SignaturePanel key={item.label} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};

export default DesignSignatures;
