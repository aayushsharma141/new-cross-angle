import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { Eye, Expand } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageParallax } from "@/hooks/useImageParallax";
import { Button } from "@/components/ui/button";

interface GalleryCardProps {
  image: string;
  category: string;
  title?: string;
  index: number;
  onClick: () => void;
  size?: 'normal' | 'featured';
}

const GalleryCard = ({
  image,
  category,
  title,
  index,
  onClick,
  size = 'normal'
}: GalleryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { containerRef, imageRef } = useImageParallax({ speed: 0.12, scale: 1.15 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: "easeInOut"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        ${size === 'featured' ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'}
      `}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Skeleton loader */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        )}

        {/* Image with parallax effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <img
            src={image}
            alt={title || category}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
        </motion.div>

        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: isHovered ? 0.9 : 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.15) 0%, transparent 50%)'
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-2"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-medium">
              {category.replace(/-/g, " ")}
            </span>
          </motion.div>

          {/* Title */}
          {title && (
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-serif font-bold text-white mb-2"
            >
              {title}
            </motion.h3>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <Button variant="outline" className="gap-2 rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors"
              aria-label="Expand image"
              title="Expand image"
            >
              <Expand className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Corner accent */}
        <motion.div
          className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default GalleryCard;
