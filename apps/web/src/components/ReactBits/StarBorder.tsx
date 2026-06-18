import React from "react";

interface StarBorderProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  backgroundColor?: string;
}

export default function StarBorder({
  as: Component = "div",
  children,
  className = "",
  color = "#8b6f47",
  speed = "6s",
  backgroundColor = "rgba(255, 255, 255, 0.9)",
}: StarBorderProps) {
  return (
    <Component
      className={`relative p-[1px] overflow-hidden rounded-2xl ${className}`}
    >
      <div
        className="absolute inset-[-1000%] animate-[spin_20s_linear_infinite] origin-center pointer-events-none"
        style={{
          animationDuration: speed,
          background: `conic-gradient(from 0deg, transparent 60%, ${color} 100%)`,
        }}
      />
      <div 
        className="relative h-full w-full rounded-[15px] overflow-hidden z-10"
        style={{ backgroundColor }}
      >
        {children}
      </div>
    </Component>
  );
}
