import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  isScrolled?: boolean;
}

const word1Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const crossangleLetterVariants: Variants = {
  hidden: { opacity: 0, y: -18, scaleY: 0.6 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const word2Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.55,
      staggerChildren: 0.055,
    },
  },
};

const interiorLetterVariants: Variants = {
  hidden: { opacity: 0, y: 14, scaleX: 0.7 },
  visible: {
    opacity: 1,
    y: 0,
    scaleX: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className,
  isScrolled,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);

  const word1 = "CROSSANGLE";
  const word2 = "INTERIOR";

  useEffect(() => {
    if (!logoRef.current) return;
    const logo = logoRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = logo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHoverX(x);
      setHoverY(y);
      logo.style.setProperty("--logo-spotlight-x", `${x}px`);
      logo.style.setProperty("--logo-spotlight-y", `${y}px`);
    };
    const handleMouseLeave = () => {
      setHoverX(null);
      setHoverY(null);
    };

    logo.addEventListener("mousemove", handleMouseMove);
    logo.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      logo.removeEventListener("mousemove", handleMouseMove);
      logo.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={logoRef}
      className={cn(
        "relative flex flex-row items-center font-serif font-bold cursor-pointer group shrink-0 logo-hover-container",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsHovered(true);
        setTimeout(() => setIsHovered(false), 800);
      }}
    >
      {/* Cursor-Reactive Illumination Highlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hoverX !== null ? 1 : 0,
          background: `radial-gradient(100px circle at var(--logo-spotlight-x, 50%) var(--logo-spotlight-y, 50%), rgba(201, 168, 118, 0.15) 0%, transparent 60%)`,
          mixBlendMode: "screen",
          zIndex: 1,
        }}
      />

      <motion.div
        variants={word1Variants}
        initial="hidden"
        animate="visible"
        className="flex mr-1.5 sm:mr-2 text-[clamp(0.9rem,3vw,1.4rem)] logo-metallic-text relative z-10"
      >
        {word1.split("").map((letter, i) => (
          <motion.span
            key={`w1-${i}`}
            variants={crossangleLetterVariants}
            className="inline-block origin-bottom"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        variants={word2Variants}
        initial="hidden"
        animate="visible"
        className="flex text-[clamp(0.9rem,3vw,1.4rem)] logo-metallic-text relative z-10"
      >
        {word2.split("").map((letter, i) => (
          <motion.span
            key={`w2-${i}`}
            variants={interiorLetterVariants}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
