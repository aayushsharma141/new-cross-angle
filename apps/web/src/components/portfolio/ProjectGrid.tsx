import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Building2, AlertCircle, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";
import { cn } from "@/lib/utils";

const STYLES = [
  { id: "Modern", label: "Modern Minimal", description: "Clean lines, neutral tones, and functional elegance." },
  { id: "Luxury", label: "Luxury Classic", description: "Rich textures, gold accents, and timeless grandeur." },
  { id: "Contemporary", label: "Warm Contemporary", description: "Modern comfort with organic materials and soft lighting." },
  { id: "Industrial", label: "Modular Smart", description: "Highly functional, industrial-inspired efficiency." },
];

const SPACES = [
  { id: "", label: "All Spaces" },
  { id: "Bedroom Interior", label: "Bedrooms" },
  { id: "Living Room Interior", label: "Living Rooms" },
  { id: "Modular Kitchen", label: "Kitchens" },
  { id: "Commercial", label: "Commercial" },
  { id: "Wardrobe", label: "Wardrobes" },
];

const SPACE_KEYWORDS: Record<string, string[]> = {
  "Bedroom Interior": ["bedroom", "suite", "master"],
  "Living Room Interior": ["living", "lounge", "family room"],
  "Modular Kitchen": ["kitchen", "culinary"],
  "Commercial": ["commercial", "corporate", "office", "executive", "workspace"],
  "Wardrobe": ["wardrobe", "closet", "dressing"],
};

const ProjectGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['all-projects'],
    queryFn: api.getProjects,
  });

  const urlStyle = searchParams.get("style") || "";
  const urlSpace = searchParams.get("space") || "";

  const [activeType, setActiveType] = useState<string>("All");
  const [activeStyle, setActiveStyle] = useState<string>(urlStyle);
  const [activeSpace, setActiveSpace] = useState<string>(urlSpace);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchType = activeType === "All" || p.type?.toLowerCase() === activeType.toLowerCase();
      const matchStyle = !activeStyle || (p.style && p.style.toLowerCase().includes(activeStyle.toLowerCase()));
      let matchSpace = true;
      if (activeSpace && SPACE_KEYWORDS[activeSpace]) {
        const keywords = SPACE_KEYWORDS[activeSpace];
        const searchText = `${p.title} ${p.brief} ${p.gallery?.map(g => g.room).join(" ") || ""}`.toLowerCase();
        matchSpace = keywords.some(kw => searchText.includes(kw));
      }
      return matchType && matchStyle && matchSpace;
    });
  }, [projects, activeType, activeStyle, activeSpace]);

  const handleStyleSelect = useCallback((styleId: string) => {
    const next = activeStyle === styleId ? "" : styleId;
    setActiveStyle(next);
    const params = new URLSearchParams(searchParams);
    if (next) params.set("style", next);
    else params.delete("style");
    setSearchParams(params, { replace: true });
  }, [activeStyle, searchParams, setSearchParams]);

  const handleSpaceSelect = useCallback((spaceId: string) => {
    setActiveSpace(spaceId);
    const params = new URLSearchParams(searchParams);
    if (spaceId) params.set("space", spaceId);
    else params.delete("space");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleReset = useCallback(() => {
    setActiveType("All");
    setActiveStyle("");
    setActiveSpace("");
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-24 flex justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-24 px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 bg-white/[0.02]">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl scale-150" />
            <div className="relative w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-primary/70" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-3">Could not load projects</h3>
          <p className="text-sm text-white/45 font-light max-w-sm leading-relaxed mb-8">
            Something went wrong while loading our portfolio. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/15 text-white/60 rounded-full hover:border-white/30 hover:text-white transition-all duration-300"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-6" id="all-projects">
      <div className="mb-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-primary" />
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">The Archives</span>
        </div>
        <h2 className="text-4xl font-extralight tracking-tight text-white md:text-5xl italic mb-4">
          Featured Projects
        </h2>
        <p className="text-sm text-white/40 font-light">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

      {/* Style Discovery Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
        {STYLES.map((style, index) => (
          <motion.button
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={() => handleStyleSelect(style.id)}
            className={cn(
              "group relative flex flex-col items-start text-left p-6 overflow-hidden transition-all duration-500",
              "border min-h-[160px]",
              activeStyle === style.id
                ? "border-primary bg-white/5"
                : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            {activeStyle === style.id && (
              <motion.div
                layoutId="styleActive"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-2">
              Style
            </span>
            <h3 className={cn(
              "text-lg font-light transition-colors duration-300 mb-2",
              activeStyle === style.id ? "text-white" : "text-white/70 group-hover:text-white"
            )}>
              {style.label}
            </h3>
            <p className="text-xs font-light text-white/40 leading-relaxed">
              {style.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Secondary filters: Space + Type */}
      <div className="flex flex-col items-center gap-6 mb-12">
        {/* Space filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {SPACES.map((space) => (
            <button
              key={space.id || "all"}
              onClick={() => handleSpaceSelect(space.id)}
              className={cn(
                "px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeSpace === space.id
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/50 hover:text-white hover:border-white/30"
              )}
            >
              {space.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {["All", "Residential", "Commercial"].map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeType === type
                  ? "bg-primary text-white"
                  : "border border-white/10 text-white/60 hover:text-white hover:border-white/30"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeType}-${activeStyle}-${activeSpace}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/portfolio/${project.slug || project.id}`}
              className="group block relative overflow-hidden bg-neutral-900 border border-white/5 rounded-2xl"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <Image
                  src={project.heroImage || project.gallery?.[0]?.images?.[0] || ""}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  imageClassName="transition-transform duration-700 group-hover:scale-105"
                  width={600}
                  height={450}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase tracking-widest text-white border border-white/10">
                    {project.type}
                  </span>
                </div>
              </div>
              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-light text-white mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-xs text-white/50">{project.location}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-white/60 line-clamp-2 mb-4 font-light">
                  {project.brief || project.approach}
                </p>
                <div className="text-[10px] uppercase tracking-widest text-primary font-medium">
                  {project.style}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-28 text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl scale-150" />
            <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Building2 className="w-9 h-9 text-primary/60" />
            </div>
          </div>

          <h3 className="text-2xl font-light text-white mb-3 tracking-tight">
            {activeType !== "All"
              ? `${activeType} Portfolio — Coming Soon`
              : "No Projects Match This Selection"}
          </h3>

          <p className="text-sm text-white/45 font-light max-w-sm leading-relaxed mb-8">
            {activeSpace
              ? "We don't have projects in this category published yet. Try a different filter."
              : activeType === "Commercial"
              ? "We're curating our latest commercial projects. In the meantime, explore our residential portfolio or discuss your commercial vision with us."
              : activeType !== "All"
              ? `We haven't published any ${activeType.toLowerCase()} projects yet — check back soon or reset your filters.`
              : "Try adjusting your filters to explore the full portfolio."}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/15 text-white/60 rounded-full hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Reset Filters
            </button>
            <Link
              to="/contact-us"
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary text-white rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
            >
              Discuss Your Project
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectGrid;
