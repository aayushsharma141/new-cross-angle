import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

const moodboardItems = [
  {
    src: "/images/projects/discovery/lifestyle-5.jpg",
    label: "Calm",
  },
  {
    src: "/images/projects/portfolio-bedroom.jpg",
    label: "Warmth",
  },
  {
    src: "/images/projects/discovery/lifestyle-4.jpg",
    label: "Silence",
  },
];

interface ProjectMoodboardProps {
  images?: Array<{ src: string; label: string }>;
}

const ProjectMoodboard = ({ images }: ProjectMoodboardProps) => {
  const items = images && images.length > 0 ? images.slice(0, 3) : moodboardItems;

  return (
    <section className="w-full py-16">
      <div className="px-6 mb-12 text-center">
        <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-400">Inspired By</h2>
      </div>

      {/* Group hover container to handle focus/blur logic */}
      <div className="group flex gap-2 md:gap-4 overflow-x-auto no-scrollbar px-6 md:px-[20vw] pb-8 items-center cursor-pointer scrollbar-hide">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className="relative w-64 md:w-80 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden transition-all duration-700 ease-out opacity-100 group-hover:opacity-40 group-hover:blur-[2px] hover:!opacity-100 hover:!blur-none hover:scale-105"
          >
            <Image
              src={item.src} 
              className="h-full w-full"
              alt={item.label} 
              width={640}
              height={854}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <span className="text-white font-serif text-2xl tracking-tight">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default ProjectMoodboard;
