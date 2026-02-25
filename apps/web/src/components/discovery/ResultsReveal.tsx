import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import html2canvas from "html2canvas";
import gsap from "gsap";
import { AestheticScores, Archetype, AIAestheticResult } from "@/types/discovery";
import { visualImages } from "@/constants/discovery";
import { Download, RotateCcw, Share2, Sun, Layers, LayoutGrid, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import logoIcon from "@/assets/logo-icon.png";

// MagicUI imports
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { Confetti } from "@/components/magicui/confetti";
import { BorderBeam } from "@/components/magicui/border-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";

interface Props {
  scores: AestheticScores;
  archetype: Archetype;
  aiResult?: AIAestheticResult | null;
  onRetake?: () => void;
}

/* ── Inline SVG Radar helpers ── */
const radarLabels = ["Warmth", "Novelty", "Social", "Structure", "Minimal"];
const radarAngles = radarLabels.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);
const toXY = (angle: number, r: number) => ({ x: 120 + Math.cos(angle) * r, y: 105 + Math.sin(angle) * r });
const ringRadii = [60, 45, 30, 15];

const ResultsReveal = ({ scores, archetype, aiResult, onRetake }: Props) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Dismiss confetti after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // GSAP Entrance Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-fade",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 }
      );
    }, cardRef);
    return () => ctx.revert();
  }, []);

  // ── Data derivation ──
  const displayName = aiResult?.identityName || archetype.name;
  const displayTagline = aiResult?.tagline || archetype.tagline;
  const displayTraits = aiResult?.traits || archetype.traits;
  const displayMaterialBias = aiResult?.materialBias || archetype.materialBias;
  const displayStrategy = aiResult?.designStrategy
    ? `${aiResult.designStrategy.lighting} ${aiResult.designStrategy.materials} ${aiResult.designStrategy.colorPalette}`
    : archetype.strategy;
  const narrative = aiResult?.narrative || displayStrategy;

  const sensoryMap = aiResult?.sensoryMap
    ? [
      { label: "LIGHT", value: aiResult.sensoryMap.light, icon: Sun },
      { label: "MATERIAL", value: aiResult.sensoryMap.material, icon: Layers },
      { label: "LAYOUT", value: aiResult.sensoryMap.layout, icon: LayoutGrid },
      { label: "ENERGY", value: aiResult.sensoryMap.energy, icon: Zap },
    ]
    : [
      { label: "LIGHT", value: scores.warmth > 6 ? "Soft & Indirect" : scores.warmth > 3 ? "Balanced & Natural" : "Crisp & Direct", icon: Sun },
      { label: "MATERIAL", value: `${displayMaterialBias} & Stone`, icon: Layers },
      { label: "LAYOUT", value: scores.social > 6 ? "Open & Flowing" : "Structured & Zoned", icon: LayoutGrid },
      { label: "ENERGY", value: scores.warmth > 6 ? "Warm & Intentional" : "Calm & Focused", icon: Zap },
    ];

  // SVG radar polygon points string
  const radarPointsStr = useMemo(() => {
    // Radar data (normalized 0-1)
    const values = [
      scores.warmth / 10,
      scores.novelty / 10,
      scores.social / 10,
      scores.structure / 10,
      scores.minimalism / 10,
    ];
    return values.map((v, i) => {
      const pt = toXY(radarAngles[i], Math.max(0.1, v) * 60);
      return `${pt.x},${pt.y}`;
    }).join(" ");
  }, [scores]);

  // Top 3 ranked images from quiz selections
  const rankedImages = useMemo(() => {
    return [...visualImages]
      .map((img) => {
        let relevance = 0;
        for (const [k, v] of Object.entries(img.tags)) {
          relevance += (v || 0) * (scores[k as keyof AestheticScores] / 10);
        }
        return { ...img, relevance };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [scores]);

  // Stat chips
  const statChips = [
    { label: sensoryMap[2].value, tag: "LAYOUT" },
    { label: sensoryMap[0].value, tag: "LIGHT" },
    { label: sensoryMap[1].value, tag: "MATERIAL" },
    { label: `${scores.novelty}/10`, tag: "OPENNESS", highlight: true },
  ];

  // Cognitive profile
  const cognitiveItems = [
    { value: scores.novelty, label: "OPENNESS", desc: scores.novelty > 6 ? "Seeks the unexpected" : "Open with anchors" },
    { value: 10 - scores.minimalism, label: "DETAIL", desc: scores.minimalism > 6 ? "Clarity over complexity" : "Rich maximalism" },
    { value: scores.warmth, label: "EMOTIONAL", desc: scores.warmth > 6 ? "Warm & inviting" : "Precise & crisp" },
    { value: scores.structure, label: "THINKING", desc: scores.structure > 6 ? "Intentional & symbolic" : "Intuitive & fluid" },
  ];

  const radarPointsZero = "120,105 120,105 120,105 120,105 120,105";

  /* ── Download as image ── */
  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);

    await new Promise((r) => setTimeout(r, 200));

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000000",
        width: window.innerWidth,
        height: window.innerHeight,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `design-dna-${displayName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      toast.success("Design DNA card downloaded!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed — try again.");
    }

    setCapturing(false);
  }, [displayName]);

  /* ── Share ── */
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `My Design DNA — ${displayName}`,
        text: `"${displayTagline}"`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }, [displayName, displayTagline]);

  // ── Split name for styled rendering ──
  const nameParts = displayName.split(" ");
  const firstWord = nameParts.length > 2 ? `${nameParts[0]} ` : "";
  const styledWord = nameParts.length > 2 ? nameParts[1] : nameParts[0];
  const restWords = nameParts.length > 2 ? ` ${nameParts.slice(2).join(" ")}` : ` ${nameParts.slice(1).join(" ")}`;

  return (
    <>
      {/* Confetti on mount */}
      {showConfetti && <Confetti onMount count={80} />}

      {/* Download overlay */}
      <AnimatePresence>
        {capturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#000000]/85 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-10 h-10 border border-[#FFC300]/30 border-t-[#FFC300] rounded-full animate-spin" />
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#FFC300] font-[DM_Sans]">
              Capturing your design DNA...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
           MAIN RESULT CARD — 100vh CSS Grid
          ═══════════════════════════════════════════ */}
      <div
        ref={cardRef}
        className="relative w-full overflow-hidden"
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          gridTemplateRows: "auto 1px 1fr 1px auto",
          background: "#0A0A0A",
          fontFamily: "'DM Sans', sans-serif",
          color: "#FAF8F5",
        }}
      >
        {/* Noise grain overlay for texture */}
        {!capturing && (
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
            }}
          />
        )}

        {/* Ambient red & gold glow (original website theme) */}
        <div className="pointer-events-none absolute top-[-20%] left-[30%] w-[40%] h-[60%] z-0"
          style={{ background: "radial-gradient(ellipse, rgba(195,0,0,0.06) 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute bottom-[-10%] right-[10%] w-[30%] h-[50%] z-0"
          style={{ background: "radial-gradient(ellipse, rgba(255,195,0,0.04) 0%, transparent 60%)" }}
        />

        {/* Watermark logo */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] z-0">
          <img src={logoIcon} alt="" className="w-[60vh] h-[60vh] object-contain grayscale" />
        </div>

        {/* ────── HERO HEADER ────── */}
        <div
          className="relative z-10 gsap-fade"
          style={{ gridColumn: "1 / -1", padding: "2.5vh 5vw 1.5vh", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          {/* Left logo mark */}
          <div style={{ minWidth: 100 }} className="flex flex-col items-start gap-2">
            <img src={logoIcon} alt="Crossangle Logo" className="h-7 w-auto object-contain drop-shadow-lg" />
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#FFC300]/80">Design Profile</div>
          </div>

          {/* Center — hero content */}
          <div className="text-center flex-1 max-w-xl mx-auto">
            <AnimatedShinyText className="text-[10px] tracking-[0.35em] uppercase text-[#FFC300]/90 mb-2 block font-medium shadow-sm">
              ✦ YOUR DESIGN DNA ✦
            </AnimatedShinyText>

            <h1
              className="leading-[0.95] mb-3"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 300,
                color: "#FAF8F5",
                letterSpacing: "-0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.4)"
              }}
            >
              {firstWord}<em className="italic text-[#FFC300]">{styledWord}</em>{restWords}
            </h1>

            <p
              className="mx-auto mb-3"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(12px, 1.2vw, 16px)",
                color: "#D4D4D4",
                maxWidth: 460,
                lineHeight: 1.6,
              }}
            >
              "{displayTagline}"
            </p>

            {/* Stat chips */}
            <div className="flex gap-2 justify-center flex-wrap mt-2">
              {statChips.map((chip, i) => (
                <div
                  key={i}
                  className="px-3 py-1 backdrop-blur-sm"
                  style={{
                    border: `1px solid ${chip.highlight ? "rgba(255,195,0,0.4)" : "rgba(255,195,0,0.15)"}`,
                    borderRadius: 2,
                    fontSize: "clamp(8px, 0.7vw, 10px)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    color: chip.highlight ? "#FFC300" : "#D4D4D4",
                    background: chip.highlight ? "rgba(255,195,0,0.05)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right meta */}
          <div className="text-right flex flex-col items-end gap-1" style={{ minWidth: 100 }}>
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#A19D94]">
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <div className="text-[12px] tracking-[0.1em] text-[#C30000] mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Spatial Blueprint</div>
          </div>
        </div>

        {/* H divider */}
        <div style={{ gridColumn: "1 / -1", background: "linear-gradient(to right, transparent, rgba(255,195,0,0.3) 20%, rgba(255,195,0,0.3) 80%, transparent)" }} />

        {/* ────── LEFT PANEL ────── */}
        <div
          className="relative z-10 flex flex-col gap-[1.5vh] overflow-hidden gsap-fade"
          style={{ padding: "1.5vh 3vw 1.5vh 5vw" }}
        >
          {/* Mood Board */}
          <div className="flex-1 min-h-0">
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.6vh]">Your Mood Board</div>
            <div className="relative flex-1 h-[calc(100%-18px)]">
              <BorderBeam colorFrom="#FFC300" colorTo="#C30000" duration={4} size={150} />
              <div className="h-full bg-[#0A0A0A] rounded-[3px] overflow-hidden p-[2px]">
                <div className="grid h-full gap-[3px]" style={{ gridTemplateColumns: "1.4fr 1fr", gridTemplateRows: "1fr 1fr" }}>
                  <div className="row-span-2 overflow-hidden">
                    <img
                      src={rankedImages[0]?.url}
                      alt="Primary mood"
                      className="w-full h-full object-cover"
                      style={{ filter: "saturate(0.9) contrast(1.05)" }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src={rankedImages[1]?.url}
                      alt="Secondary mood"
                      className="w-full h-full object-cover"
                      style={{ filter: "saturate(0.9) contrast(1.05)" }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src={rankedImages[2]?.url}
                      alt="Tertiary mood"
                      className="w-full h-full object-cover"
                      style={{ filter: "saturate(0.9) contrast(1.05)" }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensory Profile */}
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.6vh]">Sensory Profile</div>
            <div className="grid grid-cols-2 gap-[6px]">
              {sensoryMap.map((item) => (
                <div
                  key={item.label}
                  className="px-3 py-2 transition-colors relative overflow-hidden"
                  style={{ border: "1px solid rgba(255,195,0,0.15)", borderRadius: 2, background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="text-[7px] tracking-[0.25em] uppercase text-[#FFC300]/80 mb-[2px]">{item.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(12px, 1.1vw, 15px)", color: "#FAF8F5" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* V divider */}
        <div style={{ background: "linear-gradient(to bottom, transparent, rgba(255,195,0,0.3) 20%, rgba(255,195,0,0.3) 80%, transparent)" }} />

        {/* ────── RIGHT PANEL ────── */}
        <div
          className="relative z-10 flex flex-col gap-[1.5vh] overflow-hidden gsap-fade"
          style={{ padding: "1.5vh 5vw 1.5vh 3vw" }}
        >
          {/* Key Traits */}
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.6vh]">Key Traits</div>
            <div className="flex flex-wrap gap-[6px]">
              {displayTraits.slice(0, 6).map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1.5 text-[clamp(9px,0.75vw,11px)] tracking-[0.08em] shadow-sm"
                  style={{ border: "1px solid rgba(255,195,0,0.25)", borderRadius: 2, color: "#FAF8F5", background: "rgba(255,195,0,0.03)" }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Design Approach */}
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.6vh]">Design Approach</div>
            <p
              className="leading-relaxed"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(12px, 1.1vw, 15px)",
                color: "rgba(250,248,245,0.8)",
              }}
            >
              {narrative}
            </p>
            {displayTraits[0] && (
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C30000] mt-1.5 block">
                {displayTraits[0]} · {displayTraits[1] || "Expressive"}
              </span>
            )}
          </div>

          {/* Radar Chart (inline SVG) */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.4vh]">Aesthetic DNA</div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <svg viewBox="0 0 240 200" className="w-full max-h-[18vh]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="radarGradSingle" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFC300" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FFC300" stopOpacity={0.05} />
                  </radialGradient>
                </defs>
                <g transform="translate(120,105)">
                  {/* Background rings */}
                  {ringRadii.map((r) => (
                    <polygon
                      key={r}
                      points={radarAngles.map((a) => `${Math.cos(a) * r},${Math.sin(a) * r}`).join(" ")}
                      fill="none"
                      stroke="rgba(255,195,0,0.15)"
                      strokeWidth={1}
                    />
                  ))}
                  {/* Axes */}
                  {radarAngles.map((a, i) => (
                    <line key={i} x1={0} y1={0} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke="rgba(255,195,0,0.2)" strokeWidth={1} />
                  ))}
                </g>
                {/* Data polygon */}
                <polygon
                  points={radarPointsStr}
                  fill="url(#radarGradSingle)"
                  stroke="#FFC300"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  opacity={0}
                  className="radar-anim"
                >
                  <animate attributeName="points" from={radarPointsZero} to={radarPointsStr} dur="1.2s" begin="1.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" />
                  <animate attributeName="opacity" from="0" to="1" dur="1s" begin="1.5s" fill="freeze" />
                </polygon>
                {/* Labels */}
                {radarLabels.map((label, i) => {
                  const pt = toXY(radarAngles[i], 75);
                  return (
                    <text
                      key={label}
                      x={pt.x}
                      y={pt.y}
                      textAnchor="middle"
                      fill="rgba(250,248,245,0.7)"
                      fontSize={8.5}
                      fontFamily="DM Sans"
                      letterSpacing={1.2}
                      fontWeight="600"
                    >
                      {label.toUpperCase()}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Cognitive Profile */}
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFC300] mb-[0.6vh]">Cognitive Profile</div>
            <div className="grid grid-cols-4 gap-[6px]">
              {cognitiveItems.map((item) => (
                <div
                  key={item.label}
                  className="text-center py-2 px-1 transition-colors"
                  style={{ border: "1px solid rgba(255,195,0,0.15)", borderRadius: 2, background: "rgba(255,255,255,0.02)" }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 2.2vw, 32px)", fontWeight: 400, color: "#FFC300", lineHeight: 1 }}>
                    {item.value}<span className="text-[9px] text-[#A19D94] align-super">/10</span>
                  </div>
                  <div className="text-[7px] tracking-[0.2em] uppercase text-[#D4D4D4] mt-1.5">{item.label}</div>
                  <div className="text-[8px] text-[#A19D94] mt-[3px] leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* H divider */}
        <div style={{ gridColumn: "1 / -1", background: "linear-gradient(to right, transparent, rgba(255,195,0,0.3) 20%, rgba(255,195,0,0.3) 80%, transparent)" }} />

        {/* ────── FOOTER ────── */}
        <div
          className="relative z-10 gsap-fade"
          style={{ gridColumn: "1 / -1", padding: "1.2vh 5vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div className="flex items-center gap-3 text-[clamp(8px,0.65vw,10px)] tracking-[0.15em] uppercase text-[#A19D94]">
            <img src={logoIcon} alt="" className="h-4 opacity-70 grayscale" />
            <span>Crossangle Interior · Spatial Blueprint · 2026</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Share */}
            <button
              onClick={handleShare}
              title="Share Result"
              aria-label="Share Result"
              className="flex items-center justify-center w-[34px] h-[34px] transition-colors hover:bg-[#FFC300]/10"
              style={{ border: "1px solid rgba(255,195,0,0.3)", borderRadius: 2, background: "rgba(255,255,255,0.02)", color: "#FAF8F5", cursor: "pointer" }}
            >
              <Share2 size={14} />
            </button>

            {/* Start Over */}
            {onRetake && (
              <button
                onClick={onRetake}
                className="flex items-center gap-1.5 px-5 py-2.5 transition-colors hover:bg-[#FFC300]/10"
                style={{
                  border: "1px solid rgba(255,195,0,0.3)",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.02)",
                  color: "#FAF8F5",
                  fontSize: "clamp(9px, 0.75vw, 11px)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <RotateCcw size={12} />
                Start Over
              </button>
            )}

            {/* Download Card — shimmer effect */}
            <ShimmerButton
              shimmerColor="rgba(255,255,255,0.4)"
              shimmerDuration="2.5s"
              borderRadius="2px"
              background="#C30000"
              className="flex items-center gap-2 px-6 py-2.5 text-[clamp(9px,0.75vw,11px)] tracking-[0.15em] uppercase font-medium shadow-lg hover:brightness-110 transition-all"
              onClick={handleDownloadImage}
            >
              <Download size={13} className="text-[#FAF8F5]" />
              <span className="text-[#FAF8F5]">Download Card</span>
            </ShimmerButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsReveal;
