import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";

const ServicesTransformations = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: api.getFeaturedProjects,
  });

  if (projects.length === 0) return null;

  return (
    <section className="relative bg-[#020202] py-24 lg:py-36 px-6 overflow-hidden border-b border-white/[0.04]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(209,175,110,0.04),transparent)]" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-7"
        >
          <div className="w-10 h-px bg-site-crimson" />
          <span className="font-bold text-[9px] uppercase tracking-[0.45em] text-site-gold">
            Recent Transformations
          </span>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif font-normal text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.1] tracking-tight text-white"
          >
            Projects We're{" "}
            <em className="italic text-site-crimson font-light underline underline-offset-[10px] decoration-white/10 decoration-[3px]">
              Proud Of
            </em>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
          >
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-2.5 text-[0.8rem] text-white/45 hover:text-white/80 font-light transition-colors uppercase tracking-[0.15em]"
            >
              View All Projects
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/portfolio/${project.slug}`}
                className="group flex flex-col h-full overflow-hidden border border-white/[0.07] hover:border-white/[0.18] transition-all duration-500 bg-[#070707]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {project.heroImage ? (
                    <Image
                      src={project.heroImage}
                      alt={project.title}
                      className="absolute inset-0 h-full w-full"
                      imageClassName="object-cover brightness-[0.8] grayscale-[0.2] group-hover:brightness-[0.92] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      width={640}
                      height={480}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                      <span className="text-white/20 text-xs uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Type badge */}
                  <div className="absolute top-4 left-4 text-[8px] font-bold uppercase tracking-[0.3em] text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 border border-white/10">
                    {project.type === "commercial" ? "Commercial" : "Residential"}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-7">
                  {/* Location */}
                  {project.location && (
                    <div className="flex items-center gap-1.5 text-[0.75rem] text-white/35 font-light mb-3">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {project.location}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-serif text-[1.2rem] text-white font-light leading-snug mb-3 group-hover:text-site-gold transition-colors duration-300">
                    {project.title}
                  </h3>

                  {/* Challenge -> Solution -> Outcome */}
                  <div className="space-y-6 flex-1 mt-4">
                    <div className="border-l-[3px] border-white/10 pl-5">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-site-gold/60 block mb-2">Challenge</span>
                      <p className="text-[1.15rem] md:text-[1.25rem] font-serif text-white/80 leading-snug line-clamp-2">{project.challengeShort || project.brief || "Spatial constraints and outdated layout requiring modernization."}</p>
                    </div>
                    <div className="border-l-[3px] border-white/10 pl-5">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-site-gold/60 block mb-2">Solution</span>
                      <p className="text-[1.15rem] md:text-[1.25rem] font-serif text-white/80 leading-snug line-clamp-2">{project.approach || "Custom modular systems, smart lighting, and optimized workflow."}</p>
                    </div>
                    <div className="border-l-[3px] border-site-gold pl-5 bg-site-gold/[0.03] py-3 mt-4 -ml-px relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-site-gold/[0.05] to-transparent pointer-events-none" />
                      <span className="relative z-10 text-[11px] uppercase tracking-[0.2em] font-bold text-site-gold block mb-2">Outcome</span>
                      <p className="relative z-10 text-[1.25rem] md:text-[1.4rem] font-serif italic text-white font-medium leading-snug line-clamp-2">{project.resultShort || "Maximized spatial efficiency and delivered a premium luxury aesthetic."}</p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-4">
                      {project.area && project.area !== "-" && (
                        <span className="text-[0.75rem] text-white/35 font-light">{project.area}</span>
                      )}
                      {project.duration && project.duration !== "-" && (
                        <span className="text-[0.75rem] text-white/35 font-light">{project.duration}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[0.75rem] text-site-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                      View Project
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesTransformations;
