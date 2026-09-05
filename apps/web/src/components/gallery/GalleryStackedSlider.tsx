import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

interface GalleryItem {
  id: string;
  image: string;
  category: string;
  title: string;
  location?: string;
  year?: number;
  description?: string;
  slug?: string;
}

interface GalleryStackedSliderProps {
  items: GalleryItem[];
  onImageClick: (idx: number) => void;
}

export default function GalleryStackedSlider({ items, onImageClick }: GalleryStackedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first slide if items change (e.g. category filter)
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 relative py-12">
      
      {/* LEFT: Stacked Slider */}
      <div className="w-full lg:w-7/12 relative flex items-center justify-center">
        
        {/* Prev Arrow */}
        <button 
          onClick={handlePrev} 
          className="absolute -left-6 md:left-0 z-30 p-2 text-[#E31837] hover:scale-110 transition-transform cursor-pointer"
          aria-label="Previous image"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="15,4 5,12 15,20" />
          </svg>
        </button>

        {/* Stack Container */}
        <div className="relative w-full aspect-[4/3] max-w-[700px] flex items-center justify-center perspective-[1200px]">
          <AnimatePresence initial={false}>
            {items.map((item, idx) => {
              let diff = idx - currentIndex;
              // Wrap around math for infinite carousel
              const half = Math.floor(items.length / 2);
              if (diff > half) diff -= items.length;
              if (diff < -half) diff += items.length;
              
              // Only render items close to the center for performance & cleaner DOM
              if (Math.abs(diff) > 2) return null;

              const isCenter = diff === 0;
              const isLeft = diff < 0;
              const isRight = diff > 0;

              const xOffset = diff * 15; // percentage offset
              const scale = 1 - Math.abs(diff) * 0.12;
              const zIndex = 20 - Math.abs(diff);
              const opacity = 1 - Math.abs(diff) * 0.3;

              return (
                <motion.div
                  key={item.id}
                  className={`absolute w-[75%] h-full cursor-pointer shadow-2xl rounded-sm overflow-hidden ${isCenter ? 'ring-1 ring-black/5' : ''}`}
                  initial={{ opacity: 0, scale: 0.8, x: `${diff * 20}%` }}
                  animate={{ 
                    opacity,
                    scale,
                    x: `${xOffset}%`,
                    zIndex
                  }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => {
                    if (isCenter) onImageClick(idx);
                    else if (isLeft) handlePrev();
                    else if (isRight) handleNext();
                  }}
                  style={{
                    boxShadow: isCenter ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "0 10px 30px -10px rgba(0,0,0,0.15)"
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    imageClassName="object-cover"
                    loading={isCenter ? "eager" : "lazy"}
                    draggable={false}
                  />
                  {!isCenter && <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Next Arrow */}
        <button 
          onClick={handleNext} 
          className="absolute -right-6 md:right-0 z-30 p-2 text-[#E31837] hover:scale-110 transition-transform cursor-pointer"
          aria-label="Next image"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="9,4 19,12 9,20" />
          </svg>
        </button>
      </div>

      {/* RIGHT: Text Details */}
      <div className="w-full lg:w-4/12 flex flex-col justify-center px-4 lg:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="home-kicker mb-6 block text-[var(--s-text-tertiary)] uppercase tracking-widest text-xs">
              {String(currentIndex + 1).padStart(2, '0')} / {currentItem.category}
            </span>
            <h3 className="font-display text-4xl md:text-5xl lg:text-5xl text-[var(--s-text-primary)] tracking-tight leading-[1.1] mb-6">
              {currentItem.title}
            </h3>
            {currentItem.location && (
              <p className="home-body text-sm mt-4 text-[var(--s-text-secondary)]">
                {currentItem.location}{currentItem.year ? ` · ${currentItem.year}` : ""}
              </p>
            )}
            {currentItem.description && (
              <p className="home-body text-base mt-6 text-[var(--s-text-secondary)] leading-relaxed">
                {currentItem.description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
