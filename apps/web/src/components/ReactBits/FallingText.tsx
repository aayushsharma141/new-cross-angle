import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

interface FallingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function FallingText({
  text,
  className = "",
  delay = 20,
  duration = 0.6,
  threshold = 0.1,
}: FallingTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ y: -100, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 100,
                duration: duration,
                delay: (wordIndex * 2 + charIndex) * (delay / 1000),
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}
