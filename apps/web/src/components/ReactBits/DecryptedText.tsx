import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  animateOn?: "view" | "hover";
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?";

export default function DecryptedText({
  text,
  speed = 40,
  delay = 0,
  className = "",
  animateOn = "view",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const hasAnimatedRef = useRef(false);

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iterations = 0;
    
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iterations) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
      iterations += 1;
    }, speed);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (animateOn === "view" && isInView && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      const timeout = setTimeout(() => {
        startAnimation();
      }, delay);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, animateOn, text, delay]);

  const handleMouseEnter = () => {
    if (animateOn === "hover") {
      startAnimation();
    }
  };

  // Initialize display text
  useEffect(() => {
    setDisplayText(
      text
        .split("")
        .map((char) => (char === " " ? " " : "-"))
        .join("")
    );
  }, [text]);

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      style={{ display: "inline-block" }}
    >
      {displayText}
    </span>
  );
}
