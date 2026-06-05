import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FeaturedJourneys = () => {
  const { data: featuredProjects = [], isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: api.getFeaturedProjects,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-32 px-6 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-site-gold animate-spin"></div>
      </div>
    );
  }

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto py-32 px-6">
      <div className="mb-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-site-crimson" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Featured Journeys</span>
        </div>
        <h2 className="text-4xl font-extralight tracking-tight text-white md:text-6xl italic">
          Hero-Level Chronicles
        </h2>
      </div>

      <div className="mx-auto max-w-6xl space-y-48">
        {featuredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: index * 0.2 }}
            className={`flex flex-col gap-12 md:gap-24 ${
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center`}
          >
            {/* Image Stage */}
            <div className="relative w-full overflow-hidden group md:w-3/5">
              <div className="aspect-[16/9] overflow-hidden">
                <motion.img 
                  src={project.heroImage} 
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  style={{ transitionDuration: "2000ms" }}
                />
              </div>
              {/* Floating Tag */}
              <div className="absolute -bottom-6 right-6 bg-white p-6 shadow-2xl md:right-12">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Location</p>
                <p className="font-medium text-black">{project.location}</p>
              </div>
            </div>

            {/* Narrative Stage */}
            <div className="w-full space-y-8 md:w-2/5">
              <div className="space-y-4">
                <h3 className="text-sm font-medium tracking-[0.2em] text-site-gold uppercase">
                  {project.style}
                </h3>
                <h4 className="text-3xl font-light leading-tight text-white md:text-4xl">
                  {project.title}
                </h4>
                <p className="max-w-md text-base font-light leading-relaxed text-white/50">
                  {project.brief || project.approach}
                </p>
              </div>

              <div className="flex flex-wrap gap-8 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">Budget Range</p>
                  <p className="text-sm text-white">{project.budget}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">Timeline</p>
                  <p className="text-sm text-white">{project.duration || "4-6 Weeks"}</p>
                </div>
              </div>

              <Link 
                to={`/portfolio/${project.slug || project.id}`}
                className="group inline-flex items-center gap-4 py-4 text-[11px] uppercase tracking-[0.3em] text-white underline-offset-8 hover:underline decoration-site-gold transition-all"
              >
                Explore This Journey
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedJourneys;
