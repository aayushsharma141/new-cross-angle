import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";
import { cn } from "@/lib/utils";

const ProjectGrid = () => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: api.getProjects,
  });

  const [activeType, setActiveType] = useState<string>("All");
  const [activeStyle, setActiveStyle] = useState<string>("All");

  const types = ["All", "Residential", "Commercial"];
  
  // Extract unique styles
  const styles = useMemo(() => {
    const styleSet = new Set<string>();
    projects.forEach(p => {
      if (p.style) {
        p.style.split(',').forEach(s => styleSet.add(s.trim()));
      }
    });
    return ["All", ...Array.from(styleSet).filter(Boolean)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchType = activeType === "All" || p.type?.toLowerCase() === activeType.toLowerCase();
      const matchStyle = activeStyle === "All" || (p.style && p.style.includes(activeStyle));
      return matchType && matchStyle;
    });
  }, [projects, activeType, activeStyle]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-24 flex justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-site-gold animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-6">
      <div className="mb-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-site-crimson" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">The Archives</span>
        </div>
        <h2 className="text-4xl font-extralight tracking-tight text-white md:text-5xl italic mb-12">
          Explore All Journeys
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="flex flex-wrap justify-center gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium rounded-full transition-all duration-300",
                  activeType === type 
                    ? "bg-site-crimson text-white" 
                    : "border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-px w-12 bg-white/10 hidden md:block" />

          <div className="flex flex-wrap justify-center gap-2">
            {styles.map(style => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={cn(
                  "px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                  activeStyle === style 
                    ? "text-site-gold border-b border-site-gold" 
                    : "text-white/40 hover:text-white/80 border-b border-transparent"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${activeType}-${activeStyle}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project, idx) => (
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
                    <h3 className="text-xl font-light text-white mb-1 group-hover:text-site-gold transition-colors">{project.title}</h3>
                    <p className="text-xs text-white/50">{project.location}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-site-crimson transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-white/60 line-clamp-2 mb-4 font-light">
                  {project.brief || project.approach}
                </p>
                <div className="text-[10px] uppercase tracking-widest text-site-gold font-medium">
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
          {/* Glowing icon pod */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-3xl bg-site-gold/10 blur-2xl scale-150" />
            <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Building2 className="w-9 h-9 text-site-gold/60" />
            </div>
          </div>

          <h3 className="text-2xl font-light text-white mb-3 tracking-tight">
            {activeType !== "All"
              ? `${activeType} Portfolio — Coming Soon`
              : "No Projects Match This Selection"}
          </h3>

          <p className="text-sm text-white/45 font-light max-w-sm leading-relaxed mb-8">
            {activeType === "Commercial"
              ? "We're curating our latest commercial projects. In the meantime, explore our residential portfolio or discuss your commercial vision with us."
              : activeType !== "All"
              ? `We haven't published any ${activeType.toLowerCase()} projects yet — check back soon or reset your filters.`
              : "Try adjusting your filters to explore the full portfolio."}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setActiveType("All"); setActiveStyle("All"); }}
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/15 text-white/60 rounded-full hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Reset Filters
            </button>
            <Link
              to="/contact"
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-site-crimson text-white rounded-full hover:bg-site-crimson/90 transition-all duration-300 flex items-center gap-2"
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
