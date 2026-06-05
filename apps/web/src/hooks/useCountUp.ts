import { useState, useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
}

const useCountUp = (
  target: number,
  options: UseCountUpOptions = {}
) => {
  const { duration = 2000, delay = 0 } = options;
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  // Robust intersection observer using framer-motion
  const isInView = useInView(ref, { 
    once: true, 
    margin: "0px 0px -50px 0px", 
    amount: 0.3 
  });

  useEffect(() => {
    if (isInView) {
      // Use framer-motion's highly optimized animation loop
      const controls = animate(0, target, {
        duration: duration / 1000, // convert ms to seconds
        delay: delay / 1000,
        ease: "easeOut",
        onUpdate: (value) => {
          setCount(Math.floor(value));
        }
      });
      
      return () => controls.stop();
    }
  }, [isInView, target, duration, delay]);

  return { count, ref };
};

export default useCountUp;
