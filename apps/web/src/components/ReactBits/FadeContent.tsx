import { motion } from "framer-motion";
import React from "react";

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  distance?: number;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  className = "",
  distance = 15,
}: FadeContentProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: distance, 
        filter: blur ? "blur(10px)" : "blur(0px)" 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)" 
      }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
