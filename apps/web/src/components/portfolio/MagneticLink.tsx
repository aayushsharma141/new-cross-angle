import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";

interface MagneticLinkProps {
  children: React.ReactNode;
  to: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const MagneticLink = ({ children, to, className = "", onClick }: MagneticLinkProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Spring animated positions
  const x = useSpring(0, { damping: 20, stiffness: 200, mass: 0.8 });
  const y = useSpring(0, { damping: 20, stiffness: 200, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const el = ref.current;
    const box = el.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const relX = e.clientX - centerX;
    const relY = e.clientY - centerY;

    // Detection zone
    const distance = Math.sqrt(relX * relX + relY * relY);
    const radius = 60; 

    if (distance < radius) {
      // Limit pull to 8px max attraction radius
      const force = 8 / distance; 
      x.set(relX * force);
      y.set(relY * force);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isAnchor = to.startsWith("#");

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="inline-block"
    >
      {isAnchor ? (
        <a
          href={to}
          onClick={onClick}
          className={`relative group inline-flex items-center justify-center ${className}`}
        >
          {children}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-site-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </a>
      ) : (
        <Link
          to={to}
          onClick={onClick}
          className={`relative group inline-flex items-center justify-center ${className}`}
        >
          {children}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-site-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </Link>
      )}
    </motion.div>
  );
};
