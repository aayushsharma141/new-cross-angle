import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { type Project } from "@/lib/api";
import { getOptimizedUrl } from "@/lib/cdn";
import { EASE_OUT_EXPO } from "@/components/editorial";

interface ProjectArchiveCardProps {
  project: Project;
  index?: number;
}

/**
 * One project in the archive grid: image, title, tracked category · location.
 * No card chrome — the photograph is the card.
 */
export const ProjectArchiveCard = ({ project, index = 0 }: ProjectArchiveCardProps) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7, delay: Math.min(index, 5) * 0.05, ease: EASE_OUT_EXPO }}
  >
    <Link
      to={`/portfolio/${project.slug}`}
      className="group block focus-visible:outline-none"
    >
      <div className="mb-6 aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
        <img
          src={getOptimizedUrl(project.heroImage, { width: 900, quality: 80 })}
          alt={project.title}
          loading="lazy"
          decoding="async"
          width={900}
          height={675}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <h3 className="font-display text-2xl text-white transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
        {project.title}
      </h3>

      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
        <span>{project.category}</span>
        {project.location && (
          <>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
            <span>{project.location}</span>
          </>
        )}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 border-b border-white/15 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 group-hover:border-primary group-hover:text-primary">
        View project <span aria-hidden="true" className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">→</span>
      </span>
    </Link>
  </motion.li>
);

export default ProjectArchiveCard;
