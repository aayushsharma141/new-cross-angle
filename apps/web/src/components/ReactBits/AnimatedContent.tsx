import { motion } from "framer-motion";
import React from "react";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  distance = 20,
  direction = "vertical",
  reverse = false,
  duration = 0.5,
  delay = 0,
  className = "",
}: AnimatedContentProps) {
  const x = direction === "horizontal" ? (reverse ? -distance : distance) : 0;
  const y = direction === "vertical" ? (reverse ? -distance : distance) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x, y }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
