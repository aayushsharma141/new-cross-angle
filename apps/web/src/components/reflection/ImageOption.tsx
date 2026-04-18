import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";
import { Image } from "@/components/ui/enhanced/image";

interface ImageOptionProps {
  label: string;
  imageSrc: string;
  isActive: boolean;
  onClick: () => void;
}

const ImageOption = ({ label, imageSrc, isActive, onClick }: ImageOptionProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [0, 1], [-4, 4]);


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        perspective: 800,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative flex flex-col items-center w-full focus:outline-none"
    >
      <div
        className={`
          relative w-full aspect-[4/3] rounded-sm overflow-hidden border transition-all duration-300
          ${isActive
            ? "border-amber-400/70 shadow-[0_0_16px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/30"
            : "border-border/20 hover:border-border/60"
          }
        `}
      >
        <Image
          src={imageSrc}
          alt={label}
          className="h-full w-full"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
          width={560}
          height={420}
          loading="lazy"
        />
        {/* Gradient overlay at bottom for caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-sm flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.9)' }}
            >
              <Check size={9} className="text-black" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Caption inside image */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className={`text-[9px] xl:text-[10px] leading-tight font-medium text-left block ${isActive ? 'text-white' : 'text-white/80'}`}>
            {label}
          </span>
        </div>
        {/* Active overlay - subtle gold tint */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-amber-400/8' : 'bg-transparent group-hover:bg-foreground/5'}`} />
      </div>
    </motion.button>
  );
};

export default ImageOption;
