import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TactileMaterialProps {
  name: string;
  texture?: "marble" | "wood" | "brass" | "velvet" | "stone" | "glass";
  children?: React.ReactNode;
}

const textureGradients: Record<string, string> = {
  marble: "linear-gradient(135deg, rgba(240,235,226,0.12), rgba(200,194,184,0.06))",
  wood: "linear-gradient(135deg, rgba(139,90,43,0.12), rgba(92,64,51,0.06))",
  brass: "linear-gradient(135deg, rgba(209,175,110,0.15), rgba(138,111,66,0.06))",
  velvet: "linear-gradient(135deg, rgba(88,28,135,0.12), rgba(107,65,96,0.06))",
  stone: "linear-gradient(135deg, rgba(120,113,108,0.12), rgba(90,112,144,0.06))",
  glass: "linear-gradient(135deg, rgba(200,220,240,0.1), rgba(180,200,220,0.04))",
};

const textureCursors: Record<string, string> = {
  marble: "crosshair",
  wood: "crosshair",
  brass: "crosshair",
  velvet: "crosshair",
  stone: "crosshair",
  glass: "crosshair",
};

/**
 * TactileMaterial — Inline text component that responds to hover
 * with a subtle background gradient and cursor change to evoke
 * the materiality of the referenced finish. Use inside any body
 * or description text field where a material name appears.
 *
 * Example:
 *   <TactileMaterial name="Calacatta Marble" texture="marble" />
 */
export const TactileMaterial = ({ name, texture = "stone" }: TactileMaterialProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="relative inline-block cursor-crosshair group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: textureCursors[texture] }}
    >
      <motion.span
        className="relative z-10 transition-colors duration-300"
        animate={{
          color: isHovered ? "#D1AF6E" : "rgba(255,255,255,0.7)",
        }}
        transition={{ duration: 0.3 }}
      >
        {name}
      </motion.span>

      {/* Tactile Background Glow */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute -inset-x-2 -inset-y-1 rounded-md -z-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ background: textureGradients[texture] }}
          />
        )}
      </AnimatePresence>

      {/* Subtle underline that appears on hover */}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-px bg-[#D1AF6E]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />
    </span>
  );
};
