import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Flatten all images
  const allImages = gallery.flatMap((item) =>
    item.images.map((img) => ({ image: img, room: item.room }))
  );

  if (!allImages.length) return null;

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full flex flex-col gap-8 py-24 md:py-32">
      <div className="px-6 max-w-[90rem] mx-auto w-full flex justify-between items-end">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4 block">Visual Immersion</span>
          <h2 className="text-3xl text-white tracking-tight font-serif font-normal">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => scrollBy(-300)}
            aria-label="Scroll gallery left"
            title="Previous"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scrollBy(300)}
            aria-label="Scroll gallery right"
            title="Next"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 md:px-12 pb-8 scrollbar-hide w-full"
      >
        {allImages.map((item, idx) => (
          <div 
            key={idx} 
            className="relative flex-none w-[85vw] md:w-[60vw] lg:w-[50vw] aspect-[16/10] snap-center rounded-2xl overflow-hidden bg-neutral-900 border border-white/5"
          >
            <Image
              src={item.image} 
              alt={`${title} - ${item.room}`}
              className="h-full w-full"
              imageClassName="transition-transform duration-700 hover:scale-105"
              width={1200}
              height={750}
            />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-[10px] uppercase tracking-widest text-white/70">{item.room}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectGallery;
