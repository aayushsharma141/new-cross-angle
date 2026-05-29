import React from "react";
import SoftAurora from "@/components/ReactBits/SoftAurora";

export function EstimatorBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none bg-[#faf8f5]">
      <SoftAurora
        speed={0.20}
        scale={2.5}
        brightness={2.2}
        color1="#d4a84b"
        color2="#2a5c40"
        color3="#f0e5c0"
        noiseFrequency={0.8}
        noiseAmplitude={1.8}
        bandHeight={0.85}
        bandSpread={2.2}
        colorSpeed={0.6}
        enableMouseInteraction
        mouseInfluence={0.35}
        className="opacity-100"
      />
    </div>
  );
}
