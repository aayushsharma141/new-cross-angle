import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { type Project } from "@/data/projects";

interface ProjectArchiveCardProps {
  project: Project;
  spanClass: string;
}

export const ProjectArchiveCard = ({ project, spanClass }: ProjectArchiveCardProps) => {
  const [hoverDirection, setHoverDirection] = useState<"left" | "right" | "top" | "bottom">("left");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      setHoverDirection(x > 0 ? "right" : "left");
    } else {
      setHoverDirection(y > 0 ? "bottom" : "top");
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      setHoverDirection(x > 0 ? "right" : "left");
    } else {
      setHoverDirection(y > 0 ? "bottom" : "top");
    }
    setIsHovered(false);
  };

  const overlayVariants = {
    initial: (dir: string) => {
      switch (dir) {
        case "left": return { x: "-100%", y: 0 };
        case "right": return { x: "100%", y: 0 };
        case "top": return { x: 0, y: "-100%" };
        case "bottom": return { x: 0, y: "100%" };
        default: return { x: 0, y: 0 };
      }
    },
    hover: { x: 0, y: 0 },
    exit: (dir: string) => {
      switch (dir) {
        case "left": return { x: "-100%", y: 0 };
        case "right": return { x: "100%", y: 0 };
        case "top": return { x: 0, y: "-100%" };
        case "bottom": return { x: 0, y: "100%" };
        default: return { x: 0, y: 0 };
      }
    },
  };

  return (
    <motion.div
      layout
      className={`relative rounded-2xl overflow-hidden group border border-white/5 bg-white/[0.02] ${spanClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/portfolio/${project.slug}`} className="absolute inset-0 block">
        {/* Conic rotating mesh border glow */}
        <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl border border-white/5 group-hover:border-transparent transition-colors duration-300">
          <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
            <div
              className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_40%,#D1AF6E_50%,transparent_60%)] pointer-events-none"
              style={{
                animation: "rotateConic 24s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Zooming Image container */}
        <div className="absolute inset-[1px] overflow-hidden rounded-2xl bg-neutral-900 z-0">
          <motion.img
            src={project.heroImage}
            alt={project.title}
            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-95 transition-all duration-1000"
            animate={{ scale: isHovered ? 1.03 : 1.0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          {/* Ambient bottom gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none z-10" />
        </div>

        {/* Content details overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 flex flex-col justify-end h-full">
          <div className="space-y-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <span className="text-[9px] font-bold tracking-[0.25em] text-site-gold uppercase block">
              {project.category}
            </span>
            <h4 className="text-xl md:text-2xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight">
              {project.title}
            </h4>
            <div className="flex gap-4 text-[9px] font-mono tracking-widest text-white/40 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 pt-1">
              <span>{project.location}</span>
              <span>{project.area}</span>
            </div>
          </div>
        </div>

        {/* Directional Hover Glass overlay */}
        <AnimatePresence custom={hoverDirection}>
          {isHovered && (
            <motion.div
              custom={hoverDirection}
              variants={overlayVariants}
              initial="initial"
              animate="hover"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-[1px] bg-white/[0.04] backdrop-blur-xl flex items-center justify-center z-30"
            >
              <span className="text-[10px] font-semibold tracking-[0.3em] text-white uppercase border border-white/20 px-5 py-2.5 bg-[#0B0B0B]/35 hover:bg-[#FAFAFA] hover:text-black transition-colors duration-300">
                View Story →
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};
