import { useEffect, useRef, useState, useCallback } from "react";

interface Ripple {
  x: number;
  y: number;
  size: number;
  opacity: number;
  id: number;
  isClick?: boolean;
  burstIndex?: number;
  timestamp: number;
}

interface WaterRippleEffectProps {
  className?: string;
}

const WaterRippleEffect = ({ className = "" }: WaterRippleEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rippleId = useRef(0);
  const lastRippleTime = useRef(0);
  const animationFrame = useRef<number>();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const createRipple = useCallback((x: number, y: number, isClick: boolean = false, burstIndex: number = 0) => {
    const now = Date.now();
    // Throttle hover ripples to every 50ms for consistency
    if (!isClick && now - lastRippleTime.current < 50) return;
    lastRippleTime.current = now;

    rippleId.current += 1;
    
    // Different sizes for burst effect
    const baseSize = isClick ? (burstIndex === 0 ? 25 : burstIndex === 1 ? 15 : 10) : 0;
    const baseOpacity = isClick ? (burstIndex === 0 ? 0.9 : burstIndex === 1 ? 0.7 : 0.5) : 0.5;
    
    const newRipple: Ripple = {
      x,
      y,
      size: baseSize,
      opacity: baseOpacity,
      id: rippleId.current,
      isClick,
      burstIndex,
      timestamp: now,
    };

    setRipples((prev) => [...prev.slice(isClick ? -24 : -12), newRipple]);
  }, []);

  // Triple-burst click effect for desktop
  const createTripleBurst = useCallback((x: number, y: number) => {
    createRipple(x, y, true, 0);
    setTimeout(() => createRipple(x, y, true, 1), 80);
    setTimeout(() => createRipple(x, y, true, 2), 160);
  }, [createRipple]);

  useEffect(() => {
    if (isMobile) return;

    const heroSection = document.getElementById("home");
    if (!heroSection) return;

    const getPositionInHero = (clientX: number, clientY: number) => {
      const rect = heroSection.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        isInBounds: clientX >= rect.left && clientX <= rect.right &&
                    clientY >= rect.top && clientY <= rect.bottom,
      };
    };

    // Desktop mouse handlers only
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y, isInBounds } = getPositionInHero(e.clientX, e.clientY);

      if (isInBounds) {
        setTargetMousePos({ x, y });
        setIsHovering(true);
        createRipple(x, y, false);
      } else {
        setIsHovering(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Don't block click events on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"]')) {
        return;
      }

      const { x, y, isInBounds } = getPositionInHero(e.clientX, e.clientY);
      if (isInBounds) {
        createTripleBurst(x, y);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    // Add event listeners - passive where possible for performance
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("click", handleClick);
    heroSection.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      heroSection.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [createRipple, createTripleBurst, isMobile]);

  // Smooth animation using requestAnimationFrame with interpolation
  useEffect(() => {
    if (isMobile) return;

    const animate = () => {
      // Smooth mouse position interpolation (lag-free tracking)
      setMousePos((prev) => ({
        x: prev.x + (targetMousePos.x - prev.x) * 0.25,
        y: prev.y + (targetMousePos.y - prev.y) * 0.25,
      }));

      // Animate ripples
      setRipples((prev) =>
        prev
          .map((ripple) => {
            const isEarlyBurst = ripple.isClick && ripple.burstIndex !== undefined;

            // Different growth rates for burst layers
            let growthRate = ripple.isClick ? 14 : 6;
            if (isEarlyBurst && ripple.burstIndex === 1) growthRate = 10;
            if (isEarlyBurst && ripple.burstIndex === 2) growthRate = 8;

            const fadeRate = ripple.isClick ? 0.01 : 0.018;

            return {
              ...ripple,
              size: ripple.size + growthRate,
              opacity: ripple.opacity - fadeRate,
            };
          })
          .filter((ripple) => ripple.opacity > 0)
      );

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [targetMousePos, isMobile]);

  if (isMobile) return null;

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 z-[2] overflow-hidden pointer-events-none ${className}`}
    >
      {/* Ripples */}
      {ripples.map((ripple) => {
        const isBurst = ripple.isClick && ripple.burstIndex !== undefined;
        const burstColor = isBurst 
          ? ripple.burstIndex === 0 
            ? 0.8 
            : ripple.burstIndex === 1 
              ? 0.6 
              : 0.4
          : 0.4;
        
        return (
          <div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              opacity: ripple.opacity,
              border: ripple.isClick 
                ? `${2 - (ripple.burstIndex || 0) * 0.5}px solid hsl(var(--primary) / ${burstColor})` 
                : "1px solid hsl(var(--primary) / 0.4)",
              boxShadow: ripple.isClick
                ? `0 0 ${ripple.size / 2}px hsl(var(--primary) / ${burstColor * 0.6}), 
                   inset 0 0 ${ripple.size / 3}px hsl(var(--primary) / ${burstColor * 0.3}),
                   0 0 ${ripple.size}px hsl(var(--primary) / ${burstColor * 0.2})`
                : `0 0 ${ripple.size / 3}px hsl(var(--primary) / 0.25), 
                   inset 0 0 ${ripple.size / 5}px hsl(var(--primary) / 0.1)`,
              background: ripple.isClick 
                ? `radial-gradient(circle, hsl(var(--primary) / ${burstColor * 0.15}) 0%, transparent 60%)`
                : 'transparent',
              transform: 'translateZ(0)',
              willChange: 'width, height, opacity',
            }}
          />
        );
      })}

      {/* Mouse Glow - Smooth interpolated follow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: mousePos.x - 120,
          top: mousePos.y - 120,
          width: 240,
          height: 240,
          background: `radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.05) 40%, transparent 70%)`,
          opacity: isHovering ? 1 : 0,
          transform: 'translateZ(0)',
          transition: 'opacity 0.2s ease-out',
          willChange: 'transform, opacity',
        }}
      />

      {/* Cursor Core Glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: mousePos.x - 20,
          top: mousePos.y - 20,
          width: 40,
          height: 40,
          background: `radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.15) 50%, transparent 70%)`,
          boxShadow: "0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--primary) / 0.2)",
          opacity: isHovering ? 1 : 0,
          transform: 'translateZ(0)',
          transition: 'opacity 0.15s ease-out',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
};

export default WaterRippleEffect;
