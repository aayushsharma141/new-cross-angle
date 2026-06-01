import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  isScrolled?: boolean;
}

const TILT_ANGLES = [2, -1, 3, -2, 1.5, -2.5, 2, -1, 3, -2];

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
  const word1 = "CROSSANGLE";
  const word2 = "INTERIOR";

  return (
    <div
      className={cn("flex flex-row items-center font-serif font-black antialiased subpixel-antialiased cursor-pointer group shrink-0", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // Trigger hover animation on click for mobile users
        setIsHovered(true);
        setTimeout(() => setIsHovered(false), 400); // 400ms duration of the jitter animation
      }}
    >
      <motion.div
        variants={word1Variants}
        initial="hidden"
        animate="visible"
        className={cn("flex mr-1.5 sm:mr-2 text-transparent bg-clip-text bg-gradient-to-r from-[#C39E5C] via-[#FFF3C4] to-[#C39E5C] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tighter sm:tracking-tight text-[clamp(1.2rem,4vw,1.8rem)]", isHovered && "is-hovered")}
      >
        {word1.split("").map((letter, i) => (
          <motion.span
            key={`w1-${i}`}
            variants={crossangleLetterVariants}
            className="inline-block shimmer-letter jitter-letter origin-bottom"
            style={
              {
                animationDelay: `${i * 0.1}s`,
                "--tilt": `${TILT_ANGLES[i % TILT_ANGLES.length]}deg`,
              } as React.CSSProperties
            }
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        variants={word2Variants}
        initial="hidden"
        animate="visible"
        className="flex text-transparent bg-clip-text bg-gradient-to-r from-[#C39E5C] via-[#FFF3C4] to-[#C39E5C] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tighter sm:tracking-tight text-[clamp(1.2rem,4vw,1.8rem)]"
      >
        {word2.split("").map((letter, i) => (
          <motion.span
            key={`w2-${i}`}
            variants={interiorLetterVariants}
            // Add a base delay to the shimmer offset for the second word
            // word1 has 10 letters, so we start this at an offset
            className="inline-block shimmer-letter"
            style={
              {
                animationDelay: `${(word1.length + i) * 0.1}s`,
              } as React.CSSProperties
            }
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
