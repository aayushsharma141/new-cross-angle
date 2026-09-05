import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProjectArchiveCard } from "./ProjectArchiveCard";

const categories = ["All", "Residential", "Commercial", "Hospitality", "Workspace", "Retail"];

export const ProjectArchive = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "All");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && categories.includes(cat) && cat !== activeCategory) {
      setActiveCategory(cat);
    } else if (!cat && activeCategory !== "All") {
      setActiveCategory("All");
    }
  }, [searchParams, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory, projects]);

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
    <section className="relative py-[14vh] md:py-[18vh] px-6 bg-background" id="archive">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-primary/50" />
              <span className="text-primary font-bold uppercase tracking-[0.25em] text-[10px]">
                03 / THE ARCHIVE
              </span>
            </div>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-[#FAFAFA] leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Project <span className="italic text-stone-400 font-light">Collection</span>
            </h2>
          </div>

          {/* Dynamic Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`relative px-4 py-2 text-[10px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 rounded-sm
                  ${activeCategory === cat ? "text-[#FAFAFA]" : "text-white/40 hover:text-primary"}`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-primary"
                    transition={{
                      type: shouldReduceMotion ? "tween" : "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: shouldReduceMotion ? 0.01 : undefined,
                    }}
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
