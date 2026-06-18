import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const springConfig = { damping: 55, stiffness: 250, mass: 0.6 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();

    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by 150px (half of 300px glow width)
      mouseX.set(e.clientX - 150);
      mouseY.set(e.clientY - 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTouchDevice, mouseX, mouseY]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <motion.div
      style={{
        x: glowX,
        y: glowY,
      }}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full bg-site-gold/[0.03] blur-[100px] pointer-events-none z-50 mix-blend-screen"
    />
  );
};
