import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ProjectArchiveCard } from "./ProjectArchiveCard";
import { projects as realProjects, type Project } from "@/data/projects";

// Editorial mock projects to complete the Bento Grid feel across all required filter categories
const archiveProjects: Project[] = [
  {
    ...realProjects[0],
    id: "arch-1",
    category: "Residential",
  },
  {
    ...realProjects[1],
    id: "arch-2",
    category: "Residential",
  },
  {
    id: "arch-3",
    slug: "obsidian-lounge",
    title: "The Obsidian Lounge",
    client: "Hotel V",
    location: "Mumbai",
    type: "commercial",
    category: "Hospitality",
    area: "1,200 sq.ft",
    budget: "₹45 Lakhs",
    duration: "60 days",
    style: "Luxury Classic",
    year: 2024,
    heroImage: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    gallery: [],
    brief: "A moody, atmospheric cocktail lounge designed for sensory quiet amidst a chaotic urban hub.",
    approach: "Utilized raw black wood, deep ambient brass sconces, and acoustic felt backdrops.",
    materials: [],
  },
  {
    id: "arch-4",
    slug: "white-gallery",
    title: "The Alabaster Gallery",
    client: "Moda India",
    location: "Noida",
    type: "commercial",
    category: "Retail",
    area: "800 sq.ft",
    budget: "₹20 Lakhs",
    duration: "40 days",
    style: "Modern Minimalist",
    year: 2024,
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    gallery: [],
    brief: "A high-end retail boutique designed with seamless micro-concrete surfaces and invisible fixtures.",
    approach: "Designed to place products as architectural artifacts in a sculpture museum layout.",
    materials: [],
  },
  {
    ...realProjects[2],
    id: "arch-5",
    category: "Workspace",
  },
  {
    id: "arch-6",
    slug: "amber-boardroom",
    title: "The Amber Boardroom",
    client: "Nova Corp",
    location: "Gurugram",
    type: "commercial",
    category: "Workspace",
    area: "600 sq.ft",
    budget: "₹15 Lakhs",
    duration: "30 days",
    style: "Warm Contemporary",
    year: 2023,
    heroImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop",
    gallery: [],
    brief: "A warm, daylight-responsive corporate meeting chamber utilizing walnut partitions and 2700K indirect coves.",
    approach: "Designed for focused decisions with flawless video-conferencing acoustics.",
    materials: [],
  },
];

const categories = ["All", "Residential", "Commercial", "Hospitality", "Workspace", "Retail"];

export const ProjectArchive = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return archiveProjects;
    return archiveProjects.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory]);

  // Bento Span Calculator based on index
  const getBentoSpan = (index: number) => {
    const patterns = [
      "md:col-span-2 md:row-span-2 h-[500px] lg:h-[650px]", // Large
      "md:col-span-1 md:row-span-2 h-[500px] lg:h-[650px]", // Medium
      "md:col-span-1 md:row-span-1 h-[240px] lg:h-[310px]", // Small
      "md:col-span-1 md:row-span-1 h-[240px] lg:h-[310px]", // Small
      "md:col-span-2 md:row-span-1 h-[240px] lg:h-[310px]", // Wide/Medium
      "md:col-span-1 md:row-span-1 h-[240px] lg:h-[310px]", // Small
    ];
    return patterns[index % patterns.length];
  };

  return (
    <section className="relative py-24 px-6 bg-[#0B0B0B]" id="archive">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-site-gold/50" />
              <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
                03 / THE ARCHIVE
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight">
              Project <span className="italic text-stone-400 font-light">Collection</span>
            </h2>
          </div>

          {/* Dynamic Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300 whitespace-nowrap
                  ${activeCategory === cat ? "text-[#FAFAFA]" : "text-white/40 hover:text-white"}`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-site-gold"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid */}
        <LayoutGroup>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-max"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <ProjectArchiveCard
                  key={project.id}
                  project={project}
                  spanClass={getBentoSpan(idx)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {filteredProjects.length === 0 && (
          <div className="text-center py-24 text-white/40 font-serif font-light italic">
            Collection curation in progress.
          </div>
        )}

      </div>
    </section>
  );
};

export default ProjectArchive;
