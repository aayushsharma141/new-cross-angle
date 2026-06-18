import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  initialOpacity?: number;
  threshold?: number;
  className?: string;
}

export const FadeContent: React.FC<FadeContentProps> = ({
  children,
  blur = false,
  duration = 1,
  initialOpacity = 0,
  threshold = 0.1,
  className = '',
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: initialOpacity, 
        filter: blur ? 'blur(10px)' : 'none', 
        y: 20 
      }}
      animate={
        inView
          ? { opacity: 1, filter: 'blur(0px)', y: 0 }
          : { opacity: initialOpacity, filter: blur ? 'blur(10px)' : 'none', y: 20 }
      }
      transition={{ duration, ease: [0.16, 1, 0.3, 1] }} // smooth luxurious easing
      className={className}
    >
      {children}
    </motion.div>
  );
};
