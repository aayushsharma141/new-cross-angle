import React from "react";
import { AestheticScores } from "@/types/discovery";

interface DiscoveryBackgroundProps {
  scores?: AestheticScores;
  isDark?: boolean;
}

// Luxurious, interior-design-inspired muted color profiles mapping to the discovery axes
const AXIS_THEMES = {
  initial: { blob1: "#F3EDE2", blob2: "#E6DEC9", bg: "#FAF8F5" },
  warmth: { blob1: "#F2DEC4", blob2: "#E8C19C", bg: "#FAF2E8" },      // warm amber, terracotta
  minimalism: { blob1: "#EBEAE6", blob2: "#D9D8D3", bg: "#F5F5F3" },  // clean platinum plaster
  novelty: { blob1: "#E5DEF0", blob2: "#D0C5E8", bg: "#FAF8FC" },     // creative soft amethyst
  social: { blob1: "#E2ECE0", blob2: "#C5D8C1", bg: "#F3FAF2" },      // serene sage, olive biophilic
  structure: { blob1: "#DDE4EC", blob2: "#BCCAD9", bg: "#F0F4F8" },   // linen sky slate
};

export function DiscoveryBackground({ scores, isDark = false }: DiscoveryBackgroundProps) {
  // Determine dominant axis dynamically if scores are passed
  const theme = React.useMemo(() => {
    if (isDark) {
      return {
        blob1: "rgba(209, 175, 110, 0.14)", // warm gold glow
        blob2: "rgba(124, 94, 53, 0.08)",   // dark amber glow
        bg: "#070707"                       // pure deep obsidian
      };
    }

    if (!scores) return AXIS_THEMES.initial;

    const axes = [
      { key: "warmth", value: scores.warmth || 0 },
      { key: "minimalism", value: scores.minimalism || 0 },
      { key: "novelty", value: scores.novelty || 0 },
      { key: "social", value: scores.social || 0 },
      { key: "structure", value: scores.structure || 0 },
    ];

    let maxVal = 0;
    let dominantKey: keyof typeof AXIS_THEMES = "initial";

    for (const a of axes) {
      if (a.value > maxVal) {
        maxVal = a.value;
        dominantKey = a.key as keyof typeof AXIS_THEMES;
      }
    }

    return AXIS_THEMES[dominantKey] || AXIS_THEMES.initial;
  }, [scores, isDark]);

  return (
    <div 
      className="absolute inset-0 z-0 transition-colors duration-1000 overflow-hidden w-full h-full pointer-events-none"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Textured Linen Canvas Pattern */}
      <div 
        className={`absolute inset-0 opacity-[0.025] pointer-events-none ${isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Morphing Fluid Auras */}
      <div className="absolute inset-0 filter blur-[80px] md:blur-[120px] opacity-70">
        <div 
          className="absolute top-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundColor: theme.blob1,
            animation: "floatBlob1 20s infinite alternate" 
          }}
        />
        <div 
          className="absolute bottom-[15%] right-[10%] w-[50vw] h-[50vw] rounded-full transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundColor: theme.blob2,
            animation: "floatBlob2 24s infinite alternate"
          }}
        />
      </div>

      <style>{`
        @keyframes floatBlob1 {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(40px, 30px) rotate(90deg) scale(1.1); }
          100% { transform: translate(-20px, -40px) rotate(180deg) scale(0.95); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(-30px, 40px) rotate(-90deg) scale(0.9); }
          100% { transform: translate(30px, -20px) rotate(-180deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
export default DiscoveryBackground;
