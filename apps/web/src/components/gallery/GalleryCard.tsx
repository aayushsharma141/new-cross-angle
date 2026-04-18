import { motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/primitives/skeleton";

interface GalleryCardProps {
  image: string;
  category: string;
  title?: string;
  location?: string;
  year?: number;
  index: number;
  onClick: () => void;
  size?: "normal" | "featured";
}

// Subtle SVG grain overlay (no performance cost, pure CSS)
const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundSize: "180px 180px",
};

const GalleryCard = ({
  image,
  category,
  title,
  location,
  year,
  index,
  onClick,
  size = "normal",
}: GalleryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isFeatured = size === "featured";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        group relative overflow-hidden cursor-pointer rounded-none
        ${isFeatured ? "aspect-[3/4]" : index % 3 === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}
      `}
      style={{ userSelect: "none" }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-white/5" />
      )}

      {/* Image */}
      <motion.img
        src={image}
        alt={title || category}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        animate={{ scale: isHovered ? 1.06 : 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={GRAIN_STYLE}
      />

      {/* Base gradient — always visible (subtle) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Hover gradient — intensifies from bottom */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* ── Top-left editorial caption tag ─────────────────────────────── */}
      <motion.div
        className="absolute top-4 left-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : -2 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-light bg-black/40 backdrop-blur-sm px-2 py-1">
          {category}
        </span>
      </motion.div>

      {/* ── Bottom content ─────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-1">
        {/* Title */}
        {title && (
          <motion.h3
            className="font-['Cormorant_Garamond',serif] text-lg md:text-xl font-light text-white leading-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isHovered ? 1 : 0.6, y: isHovered ? 0 : 8 }}
            transition={{ duration: 0.35 }}
          >
            {title}
          </motion.h3>
        )}

        {/* Location + Year */}
        <motion.p
          className="text-[9px] uppercase tracking-[0.25em] text-white/35 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {location && `${location}`}
          {location && year && " · "}
          {year && `${year}`}
        </motion.p>

        {/* Gold bottom accent + icon */}
        <div className="flex items-center justify-between mt-1">
          <motion.div
            className="h-px bg-[#D1AF6E]"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ width: "100%", position: "absolute", bottom: 0, left: 0 }}
          />
          <motion.button
            className="ml-auto flex items-center gap-1.5 text-[#D1AF6E] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D1AF6E]"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            onClick={onClick}
            aria-label={`Open ${title || category}`}
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-light hidden sm:inline">
              Open
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryCard;
