import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

interface GalleryItem {
  room: string;
  images: string[];
}

interface ProjectGalleryProps {
  gallery: GalleryItem[];
  title: string;
}

const ProjectGallery = ({ gallery, title }: ProjectGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Flatten all images
  const allImages = gallery.flatMap((item) =>
    item.images.map((img) => ({ image: img, room: item.room }))
  );

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const navigate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    } else {
      setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-serif font-bold text-foreground flex items-center gap-3"
        >
          <span className="w-8 h-0.5 bg-primary" />
          Project Gallery
        </motion.h2>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allImages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={cn(
                "group relative overflow-hidden rounded-xl cursor-pointer",
                index === 0 && "md:col-span-2 md:row-span-2",
                index % 5 === 3 && "md:col-span-2"
              )}
              onClick={() => openLightbox(index)}
            >
              <div className={cn(
                "aspect-[4/3]",
                index === 0 && "md:aspect-square"
              )}>
                <motion.img
                  src={item.image}
                  alt={`${title} - ${item.room}`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-foreground">{item.room}</span>
                  <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                    <Expand className="w-4 h-4 text-primary" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
            >
              <X className="w-5 h-5 text-foreground group-hover:text-primary-foreground" />
            </motion.button>

            {/* Navigation Buttons */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => { e.stopPropagation(); navigate("prev"); }}
              className="absolute left-4 md:left-8 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
            >
              <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary-foreground" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => { e.stopPropagation(); navigate("next"); }}
              className="absolute right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
            >
              <ChevronRight className="w-6 h-6 text-foreground group-hover:text-primary-foreground" />
            </motion.button>

            {/* Main Image */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[currentIndex].image}
                alt={`${title} - ${allImages[currentIndex].room}`}
                imageClassName="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />

              {/* Image Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent rounded-b-xl"
              >
                <p className="text-foreground font-medium">{allImages[currentIndex].room}</p>
                <p className="text-muted-foreground text-sm">
                  {currentIndex + 1} of {allImages.length}
                </p>
              </motion.div>
            </motion.div>

            {/* Thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2 px-4"
            >
              {allImages.map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                  className={cn(
                    "w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300",
                    currentIndex === index
                      ? "ring-2 ring-primary scale-110"
                      : "opacity-50 hover:opacity-100"
                  )}
                  aria-label={`View ${item.room} image`}
                >
                  <Image
                    src={item.image}
                    alt={item.room}
                    imageClassName="w-full h-full object-cover"
                  />
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectGallery;