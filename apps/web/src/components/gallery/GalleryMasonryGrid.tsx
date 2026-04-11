import { motion, AnimatePresence } from "framer-motion";
import GalleryCard from "./GalleryCard";
import type { GalleryItem } from "@/data/galleryData";

interface GalleryMasonryGridProps {
  items: GalleryItem[];
  onItemClick: (index: number) => void;
}

const GalleryMasonryGrid = ({ items, onItemClick }: GalleryMasonryGridProps) => {
  return (
    <section className="py-4 pb-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={items.map((i) => i.id).join(",")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              columnCount: 1,
              columnGap: "12px",
            }}
            className="
              [column-count:1]
              sm:[column-count:2]
              lg:[column-count:3]
              xl:[column-count:4]
              [column-gap:12px]
            "
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-3"
                style={{ breakInside: "avoid" }}
              >
                <GalleryCard
                  image={item.image}
                  category={item.category}
                  title={item.title}
                  location={item.location}
                  year={item.year}
                  index={index}
                  onClick={() => onItemClick(index)}
                  size={index === 0 ? "featured" : "normal"}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-16 h-px bg-[#D1AF6E]/30 mx-auto mb-8" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/30 font-light">
              No projects in this category
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GalleryMasonryGrid;
