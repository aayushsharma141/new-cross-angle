import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { type Project } from "@/lib/api";

interface ProjectArchiveCardProps {
  project: Project;
  spanClass: string;
}

export const ProjectArchiveCard = React.forwardRef<HTMLDivElement, ProjectArchiveCardProps>(
  ({ project, spanClass }, ref) => {
    const shouldReduceMotion = useReducedMotion();
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
        if (shouldReduceMotion) return { opacity: 0 };
        switch (dir) {
          case "left": return { x: "-100%", y: 0, opacity: 1 };
          case "right": return { x: "100%", y: 0, opacity: 1 };
          case "top": return { x: 0, y: "-100%", opacity: 1 };
          case "bottom": return { x: 0, y: "100%", opacity: 1 };
          default: return { x: 0, y: 0, opacity: 1 };
        }
      },
      hover: { x: 0, y: 0, opacity: 1 },
      exit: (dir: string) => {
        if (shouldReduceMotion) return { opacity: 0 };
        switch (dir) {
          case "left": return { x: "-100%", y: 0, opacity: 1 };
          case "right": return { x: "100%", y: 0, opacity: 1 };
          case "top": return { x: 0, y: "-100%", opacity: 1 };
          case "bottom": return { x: 0, y: "100%", opacity: 1 };
          default: return { x: 0, y: 0, opacity: 1 };
        }
      },
    };

    return (
      <motion.div
        ref={ref}
        layout
        className={`relative rounded-2xl overflow-hidden group border border-white/5 bg-white/[0.02] ${spanClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to={`/portfolio/${project.slug}`} className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 rounded-2xl">
          {/* Conic rotating mesh border glow */}
          <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl border border-white/5 group-hover:border-transparent transition-colors duration-300">
            <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <div
                className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_40%,#D1AF6E_50%,transparent_60%)] pointer-events-none"
                style={{
                  animation: shouldReduceMotion ? "none" : "rotateConic 24s linear infinite",
                }}
              />
            </div>
          </div>

          {/* Zooming Image container */}
          <div className="absolute inset-[1px] overflow-hidden rounded-2xl bg-neutral-900 z-0">
            <motion.img
              src={project.heroImage}
              alt={`${project.title} - ${project.category} interior showcase`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-95 transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              animate={{ scale: shouldReduceMotion ? 1.0 : (isHovered ? 1.02 : 1.0) }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Ambient bottom gradient for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none z-10" />
          </div>

          {/* Content details overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 flex flex-col justify-end h-full">
            <div className="space-y-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
              <span className="text-[9px] font-bold tracking-[0.25em] text-primary uppercase block">
                {project.category}
              </span>
              <h4 
                className="text-xl md:text-2xl font-display font-normal text-[#FAFAFA] leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {project.title}
              </h4>
              <div className="flex gap-4 text-[9px] font-mono tracking-[0.2em] text-white/50 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 pt-1">
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
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-[1px] bg-white/[0.04] backdrop-blur-xl flex items-center justify-center z-30"
              >
                <span className="home-button-sweep inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-white uppercase border border-white/20 px-5 py-2.5 bg-background/50 hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 rounded-sm">
                  View Story <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    );
  }
);

ProjectArchiveCard.displayName = "ProjectArchiveCard";
