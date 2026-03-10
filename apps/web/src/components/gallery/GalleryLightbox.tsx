import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryLightboxProps {
  isOpen: boolean;
  currentIndex: number;
  items: { image: string; category: string; title?: string; slug?: string }[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onIndexChange: (index: number) => void;
}

const GalleryLightbox = ({
  isOpen,
  currentIndex,
  items,
  onClose,
  onNavigate,
  onIndexChange
}: GalleryLightboxProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onNavigate('prev');
        break;
      case 'ArrowRight':
        onNavigate('next');
        break;
    }
  }, [isOpen, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNavigate('next');
      } else {
        onNavigate('prev');
      }
    }

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
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-background/90"
          />

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Navigation buttons */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            disabled={currentIndex === 0}
            className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            disabled={currentIndex === items.length - 1}
            className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Main image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              src={currentItem.image}
              alt={currentItem.title || currentItem.category}
              className={cn(
                "max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl",
                isZoomed && "cursor-zoom-out scale-150"
              )}
              onClick={() => setIsZoomed(!isZoomed)}
              layoutId={`gallery-image-${currentIndex}`}
            />

            {/* Image info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg"
            >
              <div className="flex items-end justify-between">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-medium mb-2">
                    {currentItem.category.replace(/-/g, " ")}
                  </span>
                  {currentItem.title && (
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif font-bold text-white">
                        {currentItem.title}
                      </h3>
                      {currentItem.slug && (
                        <Link
                          to={`/portfolio/${currentItem.slug}`}
                          className="inline-block text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                        >
                          View Project Details
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <a
                    href={currentItem.image}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Thumbnail strip */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 max-w-[90vw] overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-300",
                  index === currentIndex
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-50 hover:opacity-100"
                )}
              >
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </motion.div>

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-6 left-6 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-foreground text-sm"
          >
            {currentIndex + 1} / {items.length}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryLightbox;
