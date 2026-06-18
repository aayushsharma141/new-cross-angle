import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

interface EditorialCardProps {
  num: string;
  pillar: string;
  description: string;
  projectName: string;
  projectSlug: string;
  image: string;
  isReversed?: boolean;
  delay: number;
}

const EditorialCard = ({
  num,
  pillar,
  description,
  projectName,
  projectSlug,
  image,
  isReversed = false,
  delay,
}: EditorialCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-0 max-w-6xl mx-auto w-full overflow-hidden rounded-2xl border border-white/5`}
    >
      {/* Image (60% of card) */}
      <div className="relative w-full lg:w-[60%] h-[52vw] lg:h-[420px] overflow-hidden group">
        <img
          src={image}
          alt={pillar}
          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-[1200ms] group-hover:scale-[1.03]"
        />
        {/* Gradient to blend into text side */}
        <div
          className={`absolute inset-0 bg-gradient-to-${isReversed ? "l" : "r"} from-transparent to-[#0B0B0B]/80 pointer-events-none`}
        />
      </div>

      {/* Text (40% of card) */}
      <div className="relative w-full lg:w-[40%] bg-[#0B0B0B] flex flex-col justify-center p-8 md:p-12 space-y-5 border-t lg:border-t-0 border-white/5">
        {/* Number */}
        <span className="text-[10px] font-mono text-white/25 tracking-[0.3em]">{num}</span>

        {/* Pillar title */}
        <h3 className="text-2xl md:text-3xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight">
          {pillar}
        </h3>

        {/* Client-facing description */}
        <p className="text-sm text-white/60 font-light leading-relaxed max-w-[320px]">
          {description}
        </p>

        {/* Project link */}
        <div className="pt-2">
          <span className="block text-[9px] font-mono text-white/25 tracking-[0.2em] uppercase mb-1.5">
            Featured in
          </span>
          <Link
            to={`/portfolio/${projectSlug}`}
            className="text-[10px] font-semibold tracking-[0.25em] text-site-gold uppercase hover:text-white transition-colors duration-300 inline-flex items-center gap-1.5"
          >
            {projectName}
            <span className="transform translate-x-0 hover:translate-x-0.5 transition-transform duration-300">
              →
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export const BehindTheWork = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-60px" });

  const pillars = [
    {
      num: "01",
      pillar: "Light",
      description:
        "Designed to feel calm in the evening and energetic during the day. We layer natural, architectural, and accent sources so the mood shifts with you — not against you.",
      projectName: "Executive Workspace",
      projectSlug: "executive-workspace",
      image: portfolioOffice,
      isReversed: false,
    },
    {
      num: "02",
      pillar: "Materiality",
      description:
        "Every material is chosen for how it ages, not simply how it photographs. Stone, oak, and woven textiles that feel better after ten years than they did on day one.",
      projectName: "Serene Master Suite",
      projectSlug: "serene-master-suite",
      image: portfolioBedroom,
      isReversed: true,
    },
    {
      num: "03",
      pillar: "Execution Detail",
      description:
        "The details most people never notice are often the ones they live with longest. Flush joints, concealed margins, and joinery that closes silently.",
      projectName: "Modern Culinary Space",
      projectSlug: "modern-culinary-space",
      image: portfolioKitchen,
      isReversed: false,
    },
    {
      num: "04",
      pillar: "Spatial Flow",
      description:
        "Removing barriers between cooking and gathering so the kitchen becomes the center of daily life. Space should move the way people move inside it.",
      projectName: "Modern Culinary Space",
      projectSlug: "modern-culinary-space",
      image: portfolioKitchen,
      isReversed: true,
    },
  ];

  return (
    <section className="relative bg-[#0B0B0B] py-24 px-6 overflow-hidden select-none">
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="max-w-6xl mx-auto w-full mb-20"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-px bg-site-gold/40" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
            04 / BEHIND THE WORK
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight max-w-xl">
          Four principles that shape{" "}
          <span className="italic text-stone-400 font-light">every project</span>
        </h2>
      </motion.div>

      {/* Stacked editorial cards */}
      <div className="space-y-6 max-w-6xl mx-auto w-full">
        {pillars.map((pillar, idx) => (
          <EditorialCard
            key={pillar.num}
            num={pillar.num}
            pillar={pillar.pillar}
            description={pillar.description}
            projectName={pillar.projectName}
            projectSlug={pillar.projectSlug}
            image={pillar.image}
            isReversed={pillar.isReversed}
            delay={0.1 * idx}
          />
        ))}
      </div>
    </section>
  );
};
