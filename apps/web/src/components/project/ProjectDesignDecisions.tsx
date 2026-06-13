import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Decision {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  result: string;
  localContext: string;
  ctaText: string;
  ctaLink: string;
}

interface ProjectDesignDecisionsProps {
  type?: "residential" | "commercial";
  category?: string;
}

const commercialDecisions: Decision[] = [
  {
    title: "Light Architecture",
    tagline: "Dynamic ambience from sunrise to evening retreat.",
    problem: "Deep floor plate with no natural light penetration. 100% artificial lighting creating fatigue by 3pm.",
    solution: "East-facing workstations, full-height glass partitions, and a circadian-matched lighting schedule.",
    result: "40% increase in natural light. Team reported measurably higher afternoon energy.",
    localContext: "Jamshedpur's long summer days meant maximising daylight reduced artificial lighting load by 4–5 hours daily — a both environmental and experiential win.",
    ctaText: "Discover Your Design Priorities",
    ctaLink: "/tools/discovery"
  },
  {
    title: "Acoustic Strategy",
    tagline: "Open collaboration without the noise penalty.",
    problem: "Open-plan layout creating ambient noise above 65dB, disrupting focused work.",
    solution: "Fabric-panel baffles, acoustic ceiling tiles, and soft-zone material layering.",
    result: "Ambient noise reduced below 52dB. No formal complaints since completion.",
    localContext: "Indian office culture often blends formal meetings with informal conversations. Acoustic zoning enabled both without either disrupting the other.",
    ctaText: "Explore Archetype Assessment",
    ctaLink: "/tools/archetypes"
  },
  {
    title: "Material Warmth",
    tagline: "Executive-grade identity without visual heaviness.",
    problem: "Sterile corporate finishes creating a cold, uninspiring environment.",
    solution: "Smoked oak veneers, matte concrete accents, warm terrazzo reception.",
    result: "Client satisfaction scores increased. Space used 2× more for client meetings.",
    localContext: "Indian clients and guests respond strongly to natural material warmth. The smoked oak finish was chosen specifically to feel premium without feeling foreign.",
    ctaText: "Estimate Your Investment",
    ctaLink: "/tools/estimator"
  },
];

const residentialDecisions: Decision[] = [
  {
    title: "Light Architecture",
    tagline: "Adaptive ambience from morning routine to evening retreat.",
    problem: "Room felt flat and clinical after sunset. Single overhead light source.",
    solution: "3-layer lighting: ambient cove, task reading, accent wall wash.",
    result: "Room now transitions through 4 distinct moods across the day.",
    localContext: "Indian homes typically experience power fluctuations. The layered LED system with independent dimming circuits provides continuity regardless of grid conditions.",
    ctaText: "Discover Your Design Priorities",
    ctaLink: "/tools/discovery"
  },
  {
    title: "Indian Storage System",
    tagline: "Concealed abundance. Seasonal logic built in.",
    problem: "Standard 2-door wardrobe failed to accommodate seasonal clothing rotation, linen storage, and daily-use items without visual clutter.",
    solution: "Floor-to-ceiling integrated storage wall with hidden pull-out units, seasonal loft section, and dedicated daily-access zones.",
    result: "All storage concealed. Zero visible clutter in completed photographs.",
    localContext: "Indian households manage 3–4 seasonal clothing cycles, festival wear, and daily-use separation. This system was built around that reality — not a Western minimalist template.",
    ctaText: "Explore Archetype Assessment",
    ctaLink: "/tools/archetypes"
  },
  {
    title: "Material Strategy",
    tagline: "Warm luxury that ages gracefully in Indian climates.",
    problem: "Client wanted premium finishes but cold marble tones felt disconnected from their lifestyle.",
    solution: "Natural walnut veneers, warm terrazzo flooring, linen upholstery.",
    result: "Space feels organic and lived-in from day one.",
    localContext: "Humidity cycles in Jharkhand require careful material selection. Natural oak veneers were pre-treated for dimensional stability — ensuring the warmth remains intact year-round.",
    ctaText: "Estimate Your Investment",
    ctaLink: "/tools/estimator"
  },
];

const ProjectDesignDecisions = ({ type = "commercial", category = "" }: ProjectDesignDecisionsProps) => {
  const isCommercial = type === "commercial" ||
    category?.toLowerCase().includes("commercial") ||
    category?.toLowerCase().includes("office") ||
    category?.toLowerCase().includes("corporate") ||
    category?.toLowerCase().includes("workspace");
  const decisions = isCommercial ? commercialDecisions : residentialDecisions;

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-36 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-16 md:gap-28 items-start">

          {/* Left: sticky heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32"
          >
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary flex items-center gap-4 mb-8">
              <span className="w-8 h-px bg-primary/50" /> Design Decisions
            </span>
            <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal leading-[1.1] mb-8">
              Every choice<br />
              <span className="italic text-stone-400">had a reason.</span>
            </h2>
            <p className="text-stone-500 font-light leading-relaxed text-sm max-w-xs">
              The details below are what separate a designed space from a furnished one.
            </p>
          </motion.div>

          {/* Right: accordion decisions */}
          <div className="flex flex-col">
            {decisions.map((decision, idx) => {
              const isOpen = openIdx === idx;
              return (
                <motion.div
                  key={decision.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.08 }}
                  className="border-b border-white/8 last:border-b-0"
                >
                  {/* Closed state — always visible */}
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className={`w-full flex items-start gap-8 py-10 px-4 -mx-4 rounded-xl text-left group cursor-pointer transition-colors duration-500 ${isOpen ? "bg-white/[0.02]" : "hover:bg-white/[0.02]"}`}
                  >
                    <span className="text-xs font-mono text-stone-600 pt-1 w-6 flex-shrink-0 group-hover:text-primary transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-serif text-white mb-3 group-hover:text-stone-200 transition-colors">
                        {decision.title}
                      </h3>
                      <p className="text-stone-400 font-light text-sm leading-relaxed">
                        {decision.tagline}
                      </p>
                    </div>
                    <span className={`text-stone-600 transition-all duration-300 pt-1 flex-shrink-0 text-xl font-light ${isOpen ? "rotate-45 text-primary" : ""}`}>
                      +
                    </span>
                  </button>

                  {/* Expanded state */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-14 pb-12">
                          {/* P / S / R grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600 mb-3 block">Problem</span>
                              <p className="text-stone-300 font-light text-sm leading-relaxed">{decision.problem}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600 mb-3 block">Solution</span>
                              <p className="text-stone-300 font-light text-sm leading-relaxed">{decision.solution}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600 mb-3 block">Result</span>
                              <p className="text-stone-300 font-light text-sm leading-relaxed">{decision.result}</p>
                            </div>
                          </div>

                          {/* Local context callout */}
                          <div className="border-l-2 border-primary/40 pl-5 mb-8 py-1">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-primary mb-2 block">Local Context</span>
                            <p className="text-stone-400 font-light text-sm leading-relaxed italic">
                              {decision.localContext}
                            </p>
                          </div>

                          {/* Tool CTA */}
                          <Link
                            to={decision.ctaLink}
                            className="inline-flex items-center gap-3 text-xs font-medium tracking-[0.15em] text-primary hover:text-red-400 transition-colors uppercase"
                          >
                            {decision.ctaText}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProjectDesignDecisions;
