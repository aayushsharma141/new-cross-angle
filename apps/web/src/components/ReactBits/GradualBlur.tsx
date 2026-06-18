import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

interface GradualBlurProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function GradualBlur({
  text,
  className = "",
  delay = 30,
  duration = 0.8,
  threshold = 0.1,
}: GradualBlurProps) {
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
              initial={{ filter: "blur(15px)", opacity: 0, y: 10 }}
              animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
              transition={{
                duration: duration,
                delay: (wordIndex * 2 + charIndex) * (delay / 1000),
                ease: "easeOut",
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}
