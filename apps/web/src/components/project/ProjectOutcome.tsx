import { motion } from "framer-motion";

interface ProjectSnapshotProps {
  location: string;
  area: string;
  duration: string;
  style: string;
  year: number;
  type?: string;
}

const deriveScope = (type: string | undefined): string[] => {
  if (type === "commercial") {
    return [
      "Discovery Workshop",
      "Corporate Identity Mapping",
      "Space Planning",
      "Material Strategy",
      "Lighting Design",
      "Furniture Curation",
      "Acoustic Strategy",
    ];
  }
  return [
    "Discovery Workshop",
    "Lifestyle Mapping",
    "Space Planning",
    "Material Strategy",
    "Lighting Design",
    "Furniture Curation",
    "Styling & Finishing",
  ];
};

const dnaScores = [
  { label: "Warmth", score: 92 },
  { label: "Comfort", score: 89 },
  { label: "Storage", score: 95 },
  { label: "Luxury", score: 85 },
  { label: "Minimalism", score: 78 },
];

const ProjectOutcome = ({ location, area, duration, style, year, type }: ProjectSnapshotProps) => {
  const scope = deriveScope(type);
  const isCommercial = type === "commercial";

  const metrics = [
    { label: "Location", value: location || "Jamshedpur, India" },
    { label: "Project Type", value: isCommercial ? "Executive Workspace" : "Premium Residential" },
    { label: "Client Profile", value: isCommercial ? "Corporate" : "Private Client" },
    { label: "Archetype", value: "The Warm Minimalist" },
    { label: "Area", value: area && area !== "-" ? area : "4,500 sq ft" },
    { label: "Timeline", value: duration && duration !== "-" ? duration : "12 Weeks" },
    { label: "Year", value: String(year || 2023) },
    { label: "Style", value: style || "Contemporary" },
  ];

  return (
    <section className="py-24 md:py-36 border-t border-white/5 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-20 md:mb-28"
        >
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Project Dashboard</span>
          <span className="flex-1 h-px bg-white/10 max-w-xs" />
        </motion.div>

        {/* 3-column dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">

          {/* Column 1: Project Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-neutral-950 p-10 md:p-12 hover:bg-neutral-900/80 transition-colors duration-500"
          >
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-10 font-medium">
              Project Profile
            </h3>
            <div className="flex flex-col gap-8">
              {metrics.map((m) => (
                <div key={m.label} className="border-b border-white/5 pb-8 last:border-b-0 last:pb-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600 mb-2">{m.label}</p>
                  <p className="text-sm font-light text-stone-200">{m.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Design DNA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-neutral-900/60 p-10 md:p-12 hover:bg-neutral-800/60 transition-colors duration-500"
          >
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-10 font-medium">
              Design DNA
            </h3>
            <div className="flex flex-col gap-7">
              {dnaScores.map((dna, idx) => (
                <motion.div key={dna.label}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs text-stone-400 uppercase tracking-[0.1em]">{dna.label}</span>
                    <span className="text-[10px] font-mono text-stone-600">{dna.score}</span>
                  </div>
                  <div className="w-full h-px bg-white/8 relative">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${dna.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, delay: 0.3 + idx * 0.12, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Column 3: Services Delivered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-neutral-950 p-10 md:p-12 hover:bg-neutral-900/80 transition-colors duration-500"
          >
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-10 font-medium">
              Services Delivered
            </h3>
            <div className="flex flex-col gap-5">
              {scope.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.06 }}
                  className="flex items-center gap-4 pb-5 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <span className="text-primary text-[10px] flex-shrink-0">✓</span>
                  <span className="text-sm text-stone-300 font-light">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ProjectOutcome;
