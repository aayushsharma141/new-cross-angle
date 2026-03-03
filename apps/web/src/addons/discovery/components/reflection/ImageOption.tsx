import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";

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

  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);

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
        perspective: 600,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative flex flex-col items-center gap-2 w-full"
    >
      <div
        className={`
          relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300
          ${isActive
            ? "border-primary shadow-lg ring-2 ring-primary/20"
            : "border-transparent hover:border-border"
          }
        `}
      >
        <img
          src={imageSrc}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "hsl(var(--gold))" }}
            >
              <Check size={14} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Overlay gradient on hover */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-primary/5' : 'bg-transparent group-hover:bg-foreground/5'}`} />
      </div>
      <span className={`text-xs text-center leading-tight transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </motion.button>
  );
};

export default ImageOption;
