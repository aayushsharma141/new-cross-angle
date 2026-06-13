import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";

interface ImageOptionProps {
  label: string;
  imageSrc: string;
  assetKey?: string;
  isActive: boolean;
  onClick: () => void;
}

const ImageOption = ({ label, imageSrc, assetKey, isActive, onClick }: ImageOptionProps) => {
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
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        perspective: 800,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative flex flex-col items-center w-full h-full rounded-[6px] focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all"
    >
      <div
        className={`
          relative w-full h-full rounded-[6px] overflow-hidden border transition-all duration-300
          ${isActive
            ? "border-[#8b6f47] shadow-[0_0_16px_rgba(139,111,71,0.25)] ring-2 ring-[#8b6f47]/30"
            : "border-[#1a1a1a]/15 hover:border-[#1a1a1a]/35"
          }
        `}
      >
        <MediaSlot
          assetKey={assetKey || `discovery_reflect-${label.replace(/\s+/g, '-').toLowerCase()}`}
          fallbackUrl={imageSrc}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay at bottom for caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-[#8b6f47] border-2 border-white shadow-[0_3px_8px_rgba(0,0,0,0.35)] z-10"
            >
              <Check size={14} className="text-white" strokeWidth={3.5} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Caption inside image */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <span className={`text-[10px] xl:text-[11px] leading-tight font-medium text-left block ${isActive ? 'text-white font-semibold' : 'text-white/90'}`}>
            {label}
          </span>
        </div>
        {/* Active overlay - subtle gold tint */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-[#8b6f47]/10' : 'bg-transparent group-hover:bg-[#1a1a1a]/5'}`} />
      </div>
    </motion.button>
  );
};

export default ImageOption;
