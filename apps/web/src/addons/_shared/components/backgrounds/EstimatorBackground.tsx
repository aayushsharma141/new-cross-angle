import React from "react";
import { GridDistortion } from "@/components/ReactBits";

export function EstimatorBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none bg-[#faf8f5]">
      <GridDistortion
        amplitude={0.10}
        speed={0.08}
        color="rgba(139, 111, 71, 0.25)"
      />
    </div>
  );
}
