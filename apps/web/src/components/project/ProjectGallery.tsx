import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

interface GalleryItem {
  room: string;
  images: string[];
}

interface ProjectGalleryProps {
  gallery: GalleryItem[];
  title?: string;
}

const ProjectGallery = ({ gallery, title = "Cinematic Views" }: ProjectGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && scrollRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scrollWidth = scrollRef.current.scrollWidth;
        setDragConstraints({
          right: 0,
          left: Math.min(0, -(scrollWidth - containerWidth)),
        });
      }
    };

    updateConstraints();
    setTimeout(updateConstraints, 300);
    const imgs = scrollRef.current?.querySelectorAll("img");
    imgs?.forEach((img) => img.addEventListener("load", updateConstraints));
    window.addEventListener("resize", updateConstraints);
    return () => {
      imgs?.forEach((img) => img.removeEventListener("load", updateConstraints));
      window.removeEventListener("resize", updateConstraints);
    };
  }, []);

  // Flatten all images
  const allImages = gallery.flatMap((item) =>
    item.images.map((img) => ({ image: img, room: item.room }))
  );

  if (!allImages.length) return null;

  return (
    <section className="w-full flex flex-col gap-8 py-24 md:py-32 overflow-hidden" ref={containerRef}>
      <div className="px-6 max-w-[90rem] mx-auto w-full flex justify-between items-end">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4 block">Visual Immersion</span>
          <h2 className="text-3xl text-white tracking-tight font-serif font-normal">{title}</h2>
        </div>
      </div>

      <motion.div 
        ref={scrollRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        dragMomentum={true}
        style={{ touchAction: "pan-y" }}
        className="flex gap-6 w-max px-6 md:px-12 pb-8 cursor-grab active:cursor-grabbing"
      >
        {allImages.map((item, idx) => (
          <motion.div 
            key={idx} 
            className="relative flex-none w-[85vw] md:w-[60vw] lg:w-[50vw] aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 group"
          >
            <Image
              src={item.image} 
              alt={`${title} - ${item.room}`}
              className="h-full w-full pointer-events-none"
              imageClassName="transition-transform duration-700 group-hover:scale-105"
              width={1200}
              height={750}
              draggable={false}
            />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-[10px] uppercase tracking-widest text-white/70">{item.room}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ProjectGallery;
