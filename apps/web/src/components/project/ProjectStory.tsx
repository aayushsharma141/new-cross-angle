import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

interface ProjectStoryProps {
  brief: string;
  approach: string;
  title: string;
  image?: string;
}

const ProjectStory = ({ brief, approach, image }: ProjectStoryProps) => {
  return (
    <div className="py-24 md:py-32 w-full" id="story">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col gap-8 order-2 lg:order-1"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary flex items-center gap-4">
            <span className="w-8 h-px bg-primary/50" /> The Intent
          </span>
          <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal leading-[1.2]">
            {brief}
          </h2>
          <p className="text-base md:text-lg text-stone-400 font-light leading-relaxed">
            {approach}
          </p>
        </motion.div>

        {/* Right: Immersive Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative aspect-[4/5] rounded-2xl overflow-hidden group order-1 lg:order-2 bg-neutral-900 border border-white/5"
        >
          {image && (
            <>
              <Image
                src={image} 
                alt="Mood Vibe" 
                className="absolute inset-0 h-full w-full"
                imageClassName="mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-1000 ease-out"
                width={840}
                height={1050}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default ProjectStory;
