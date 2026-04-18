import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";
import { getOptimizedUrl } from "@/lib/cdn";

interface LightboxItem {
  image: string;
  category: string;
  title?: string;
  slug?: string;
  description?: string;
  location?: string;
  year?: number;
}

interface GalleryLightboxProps {
  isOpen: boolean;
  currentIndex: number;
  items: LightboxItem[];
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onIndexChange: (index: number) => void;
}

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundSize: "128px 128px",
};

const GalleryLightbox = ({
  isOpen,
  currentIndex,
  items,
  onClose,
  onNavigate,
  onIndexChange,
}: GalleryLightboxProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    },
    [isOpen, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll and prevent layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) onNavigate(diff > 0 ? "next" : "prev");
    setTouchStart(null);
  };

  const currentItem = items[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#050505]/96 backdrop-blur-xl"
            style={GRAIN_STYLE}
          />
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={GRAIN_STYLE}
          />

          {/* ── Desktop: Left Info Panel ──────────────────────────────── */}
          <motion.div
            className="hidden lg:flex relative z-10 w-72 xl:w-80 flex-shrink-0 flex-col justify-end p-10 border-r border-white/5"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ delay: 0.15 }}
          >
            {/* Category */}
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#D1AF6E]/60 font-light mb-4">
              {currentItem.category}
            </span>

            {/* Rule */}
            <div className="w-8 h-px bg-[#D1AF6E]/30 mb-5" />

            {/* Title */}
            {currentItem.title && (
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl xl:text-3xl font-light text-white leading-snug mb-4">
                {currentItem.title}
              </h2>
            )}

            {/* Description */}
            {currentItem.description && (
              <p className="text-sm text-white/40 font-light leading-relaxed mb-6">
                {currentItem.description}
              </p>
            )}

            {/* Location + Year */}
            {(currentItem.location || currentItem.year) && (
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/25 font-light mb-8">
                {currentItem.location}
                {currentItem.location && currentItem.year && " · "}
                {currentItem.year}
              </p>
            )}

            {/* CTA link */}
            {currentItem.slug && (
              <Link
                to={`/portfolio/${currentItem.slug}`}
                className="self-start text-[10px] uppercase tracking-[0.25em] text-[#D1AF6E] hover:text-[#D1AF6E]/70 transition-colors border-b border-[#D1AF6E]/30 pb-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                View Full Project
              </Link>
            )}

            {/* Counter */}
            <div className="mt-auto pt-10">
              <span className="font-['Cormorant_Garamond',serif] text-5xl font-light text-white/10">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-white/20 ml-2">
                / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          {/* ── Main Image Area ────────────────────────────────────────── */}
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 md:px-10 pt-8">
              {/* Mobile counter */}
              <span className="lg:hidden text-[10px] uppercase tracking-[0.25em] text-white/30 font-light">
                {currentIndex + 1} / {items.length}
              </span>
              <span className="hidden lg:block" />

              {/* Close */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                aria-label="Close lightbox"
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6 stroke-1" />
              </motion.button>
            </div>

            {/* Image */}
            <div
              className="flex-1 flex items-center justify-center px-6 md:px-16 py-6"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-center h-full w-full max-h-[72vh] absolute"
                >
                  <img
                    src={getOptimizedUrl(currentItem.image, { width: 1200, quality: 90 }) || currentItem.image}
                    alt={currentItem.title || currentItem.category}
                    className="max-w-full max-h-[72vh] object-contain shadow-2xl"
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Navigation Row ────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-10 py-8 border-t border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev */}
              <motion.button
                onClick={() => onNavigate("prev")}
                disabled={currentIndex === 0}
                aria-label="Previous image"
                className="flex items-center gap-3 text-white/30 hover:text-[#D1AF6E] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-[18px] font-light">←</span>
                <span className="text-[9px] uppercase tracking-[0.3em] hidden sm:inline">Prev</span>
              </motion.button>

              {/* Thumbnail strip (desktop only) */}
              <div className="hidden md:flex gap-1.5 max-w-md overflow-x-auto scrollbar-none">
                {items.map((item, idx) => {
                  // Show current and nearby 3 thumbnails to keep it centered visually
                  if (idx < currentIndex - 3 || idx > currentIndex + 3) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => onIndexChange(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                      className={cn(
                        "flex-shrink-0 w-14 h-10 overflow-hidden transition-all duration-300",
                        idx === currentIndex
                          ? "ring-1 ring-[#D1AF6E] opacity-100"
                          : "opacity-30 hover:opacity-70"
                      )}
                    >
                      <Image
                        src={item.image}
                        alt={item.category}
                        className="h-full w-full object-cover"
                        width={112}
                        height={80}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <motion.button
                onClick={() => onNavigate("next")}
                disabled={currentIndex === items.length - 1}
                aria-label="Next image"
                className="flex items-center gap-3 text-white/30 hover:text-[#D1AF6E] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-[9px] uppercase tracking-[0.3em] hidden sm:inline">Next</span>
                <span className="text-[18px] font-light">→</span>
              </motion.button>
            </div>

            {/* Mobile title strip */}
            {currentItem.title && (
              <div className="lg:hidden px-6 pb-6 text-center border-t border-white/5 pt-4">
                <p className="font-['Cormorant_Garamond',serif] text-lg font-light text-white/70">
                  {currentItem.title}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-white/25 mt-1">
                  {currentItem.category}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryLightbox;
