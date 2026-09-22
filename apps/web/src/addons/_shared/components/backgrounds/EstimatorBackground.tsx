import React from "react";
import { GridDistortion } from "@/components/ReactBits";

interface EstimatorBackgroundProps {
  isDark?: boolean;
}

export function EstimatorBackground({ isDark = false }: EstimatorBackgroundProps = {}) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none ${isDark ? 'bg-[#070707]' : 'bg-kiro-bg'}`}>
      <GridDistortion
        amplitude={0.04}
        speed={0.02}
        color={isDark ? "rgba(209, 175, 110, 0.12)" : "rgba(139, 111, 71, 0.12)"}
        lineWidth={0.5}
      />
    </div>
  );
}
