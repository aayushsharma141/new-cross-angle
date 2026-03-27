import { motion, AnimatePresence } from "framer-motion";
import GalleryCard from "./GalleryCard";

interface GalleryItem {
  category: string;
  image: string;
  title?: string;
}

interface GalleryMasonryGridProps {
  items: GalleryItem[];
  onItemClick: (index: number) => void;
}

const GalleryMasonryGrid = ({ items, onItemClick }: GalleryMasonryGridProps) => {
  // Determine featured items (every 5th item in the filtered list)
  const getFeaturedIndices = (length: number) => {
    const indices: number[] = [];
    for (let i = 0; i < length; i += 5) {
      indices.push(i);
    }
    return indices;
  };

  const featuredIndices = getFeaturedIndices(items.length);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={items.map(i => i.image).join(',')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto"
          >
            {items.map((item, index) => (
              <GalleryCard
                key={`${item.image}-${index}`}
                image={item.image}
                category={item.category}
                title={item.title}
                index={index}
                onClick={() => onItemClick(index)}
                size={featuredIndices.includes(index) ? 'featured' : 'normal'}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg">No projects found in this category.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GalleryMasonryGrid;
