import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";
import { EASE_OUT_EXPO } from "@/components/editorial";
import { cn } from "@/lib/utils";

export interface MasonryItem {
  id: string;
  image: string;
  category: string;
  title: string;
  location?: string;
  year?: number;
}

interface GalleryMasonryProps {
  items: MasonryItem[];
  /** Flat index into the filtered list, so the lightbox opens on the right frame. */
  indexOf: (item: MasonryItem) => number;
  onImageClick: (index: number) => void;
}

/**
 * CSS-column masonry. Images keep their own aspect ratio and carry a small
 * tracked caption; clicking one opens the lightbox at its flat index.
 */
export const GalleryMasonry = ({ items, indexOf, onImageClick }: GalleryMasonryProps) => (
  // Column count is chosen so balancing never leaves an empty column: four
  // items balance into 2x2, anything from five up fills three columns.
  <ul
    className={cn(
      "gap-6 [column-fill:_balance]",
      "columns-1",
      items.length >= 2 && "sm:columns-2",
      (items.length === 3 || items.length >= 5) && "lg:columns-3",
    )}
  >
    {items.map((item, i) => (
      <motion.li
        key={item.id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, delay: Math.min(i, 6) * 0.04, ease: EASE_OUT_EXPO }}
        className="mb-6 break-inside-avoid"
      >
        <button
          type="button"
          onClick={() => onImageClick(indexOf(item))}
          className="group block w-full text-left focus-visible:outline-none"
          aria-label={`View ${item.title}`}
        >
          <div className="overflow-hidden bg-white/[0.03]">
            <Image
              src={item.image}
              alt={item.title}
              className="w-full"
              imageClassName="w-full h-auto transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading="lazy"
              draggable={false}
            />
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors duration-300 group-hover:text-white/70 group-focus-visible:text-primary">
            <span className="text-white/70 group-hover:text-white">{item.title}</span>
            {item.location && (
              <>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                <span>{item.location}</span>
              </>
            )}
          </p>
        </button>
      </motion.li>
    ))}
  </ul>
);

export default GalleryMasonry;
