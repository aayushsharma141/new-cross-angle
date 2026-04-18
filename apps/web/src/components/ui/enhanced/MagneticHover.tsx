import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useReducedMotion from "@/hooks/useReducedMotion";

interface MagneticHoverProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

const MagneticHover = ({
  children,
  className,
  strength = 0.24,
}: MagneticHoverProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 18, mass: 0.14 });
  const springY = useSpring(y, { stiffness: 190, damping: 18, mass: 0.14 });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
};

export default MagneticHover;
