import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProjectArchiveCard } from "./ProjectArchiveCard";
import { Section, reveal } from "@/components/editorial";
import { cn } from "@/lib/utils";

const categories = ["All", "Residential", "Commercial", "Hospitality", "Workspace", "Retail"];

/**
 * The project archive: a filter row over an even three-column grid.
 * Category lives in `?category=` so a filtered view is linkable.
 */
export const ProjectArchive = () => {
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

  return (
    <Section id="archive" spacing="tight">
      {/* Filters */}
      <motion.div {...reveal()} className="mb-14 -mx-6 flex items-center gap-x-8 overflow-x-auto whitespace-nowrap border-b border-white/10 px-6 pb-5 [scrollbar-width:none] md:mx-0 md:mb-20 md:px-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
            className={cn(
              "relative shrink-0 py-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors duration-300",
              "focus-visible:outline-none focus-visible:text-primary",
              activeCategory === cat ? "text-white" : "text-white/40 hover:text-white",
            )}
          >
            {cat}
            {activeCategory === cat && (
              <motion.span
                layoutId="archiveFilterUnderline"
                aria-hidden="true"
                className="absolute -bottom-[21px] left-0 h-px w-full bg-primary"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 tabular-nums sm:inline">
          {filteredProjects.length} {filteredProjects.length === 1 ? "work" : "works"}
        </span>
      </motion.div>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <LayoutGroup>
          <motion.ul layout className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <ProjectArchiveCard key={project.id} project={project} index={idx} />
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      ) : (
        <p className="py-24 text-center font-display text-xl font-light italic text-white/40">
          Collection curation in progress.
        </p>
      )}
    </Section>
  );
};

export default ProjectArchive;
