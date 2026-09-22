import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Image as ImageIcon, Video, Eye, X, Sparkles,
  ChevronLeft, ChevronRight, Maximize2, MessageCircle
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getOptimizedUrl } from "@/lib/cdn";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

const img = (src: string, width = 1200) => getOptimizedUrl(src, { width, quality: 80 });

// ─── Data ────────────────────────────────────────────────────────────────────

type Hotspot = {
  id: string;
  x: number; // % in panorama strip
  y: number;
  tag: string;
  title: string;
  description: string;
  img: string;
  swatch: {
    name: string;
    type: string;
    whyChosen: string;
    durability: string;
    maintenance: string;
  };
};

type ProjectAsset = {
  photos: string[];
  videoUrl: string;
  panoramic: string;
  hotspots: Hotspot[];
};

const PROJECT_ASSETS: Record<string, ProjectAsset> = {
  "serene-master-suite": {
    photos: [
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramic: img(portfolioBedroom, 1920),
    hotspots: [
      { id: "h1", x: 35, y: 55, tag: "Furniture", title: "Bespoke Suede Headboard", description: "Custom-upholstered headboard with built-in walnut ledges and integrated charging slots.", img: img(portfolioBedroom, 600), swatch: { name: "Belgian Suede-Velvet", type: "Furniture Fabric", whyChosen: "Sourced for acoustic dampening and rich tactile response.", durability: "100,000 double rubs, stain-resistance treated.", maintenance: "Gentle dry vacuuming with a soft brush." } },
      { id: "h2", x: 50, y: 28, tag: "Lighting", title: "Concealed 2700K LED Cove", description: "Indirect ceiling track lighting casting a soft reading halo.", img: img(portfolioBedroom, 600), swatch: { name: "Warm Plaster Plinth", type: "Wall Coating", whyChosen: "Clay-based plaster catches indirect cove light without glare.", durability: "High-hardness polymer-infused mineral binder.", maintenance: "Water-based micro-cloth wipe." } },
      { id: "h3", x: 65, y: 40, tag: "Storage", title: "Handleless Walnut Closets", description: "Floor-to-ceiling wardrobes flush with perimeter walls.", img: img(portfolioBedroom, 600), swatch: { name: "Walnut Veneer Panel", type: "Cabinetry Veneer", whyChosen: "Vertical grain creates visual height extension.", durability: "Multi-ply core resists structural expansion.", maintenance: "Dry dusting, periodic timber oil." } },
    ],
  },
  "modern-culinary-space": {
    photos: [
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramic: img(portfolioKitchen, 1920),
    hotspots: [
      { id: "h1", x: 35, y: 65, tag: "Island", title: "Calacatta Quartz Island", description: "A 3-meter seamless slab serving as the social cooking hub.", img: img(portfolioKitchen, 600), swatch: { name: "Arctic White Quartz", type: "Countertop Stone", whyChosen: "Non-porous, food-safe, crisp visual anchor.", durability: "Engineered mineral, scratch-proof, zero heat damage.", maintenance: "Neutral soapy sponge wipe-down." } },
      { id: "h2", x: 50, y: 45, tag: "Cabinetry", title: "Flush Acrylic Fronts", description: "High-gloss panels that reflect light and visually expand the zone.", img: img(portfolioKitchen, 600), swatch: { name: "German Acrylic Fronts", type: "Cabinet Finish", whyChosen: "Ultra-glossy surface expands spatial scale with light.", durability: "Anti-scratch film shield, humidity-resistant.", maintenance: "Soft microfiber wipe only." } },
      { id: "h3", x: 65, y: 30, tag: "Fixtures", title: "PVD Brushed Brass Mixers", description: "Premium fixtures breaking the monochrome with warm contrast.", img: img(portfolioKitchen, 600), swatch: { name: "Brushed Brass (PVD)", type: "Metallic Fixtures", whyChosen: "Anti-oxidation finish matching custom joinery warmth.", durability: "Zero oxidation, scratch-hardened PVD coat.", maintenance: "Gentle soap wipe, no acid cleaners." } },
    ],
  },
  "executive-workspace": {
    photos: [
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramic: img(portfolioOffice, 1920),
    hotspots: [
      { id: "h1", x: 35, y: 60, tag: "Furniture", title: "Cantilevered Oak Desk", description: "Solid oak slab cantilevered from structural columns with hidden cable routing.", img: img(portfolioOffice, 600), swatch: { name: "Solid White Oak", type: "Desk Timber", whyChosen: "Grain structure projects authority and organic warmth.", durability: "Kiln-dried with matte sealant coatings.", maintenance: "Wipe dry, absorb spills immediately." } },
      { id: "h2", x: 50, y: 40, tag: "Acoustics", title: "Grooved Felt Cladding", description: "Acoustic absorber lining bays to minimize conference echo.", img: img(portfolioOffice, 600), swatch: { name: "Acoustic PET Felt", type: "Wall Acoustic Panel", whyChosen: "Reduces frequency bounce in virtual board meetings.", durability: "Fire-rated recycled PET, fray-resistant.", maintenance: "Surface vacuuming with brush head." } },
      { id: "h3", x: 65, y: 20, tag: "Framework", title: "Anodized Aluminum Trim", description: "Thin metal geometries outlining spatial boundary panes.", img: img(portfolioOffice, 600), swatch: { name: "Matte Black Aluminum", type: "Structural Trim", whyChosen: "Enforces strict visual geometries for professional margins.", durability: "Anodized, corrosion-proof, scratch-proof.", maintenance: "Dry microfiber dusting." } },
    ],
  },
};

const VIDEO_CHAPTERS = [
  { time: "0:00", label: "Client Reality" },
  { time: "0:22", label: "Design Challenges" },
  { time: "0:45", label: "Key Decisions" },
  { time: "1:08", label: "Room Walkthrough" },
];

type ActiveMode = "video" | "360" | "photos";

// ─── Keyboard / focus utilities ───────────────────────────────────────────────

function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function handler(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [active, containerRef]);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectExperienceCanvasProps {
  /** WhatsApp number without dashes/spaces, e.g. '917909041132' */
  whatsapp?: string;
}

export const ProjectExperienceCanvas = ({ whatsapp = "917909041132" }: ProjectExperienceCanvasProps) => {
  const { slug } = useParams<{ slug: string }>();

  const activeSlug = slug as keyof typeof PROJECT_ASSETS | undefined;
  const assets = (activeSlug && PROJECT_ASSETS[activeSlug]) ? PROJECT_ASSETS[activeSlug] : PROJECT_ASSETS["serene-master-suite"];

  // ── Mode state ──
  const [activeMode, setActiveMode] = useState<ActiveMode>("video");
  const [activeSpot, setActiveSpot] = useState<Hotspot | null>(null);

  // ── Gallery state ──
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Video state ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // ── 360 drag state ──
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const panoRef = useRef<HTMLDivElement>(null);
  const [showTourHint, setShowTourHint] = useState(true);

  // ── Refs for focus management ──
  const lightboxRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLDivElement>(null);
  useFocusTrap(lightboxOpen, lightboxRef as React.RefObject<HTMLElement>);
  useFocusTrap(activeSpot !== null, swatchRef as React.RefObject<HTMLElement>);

  // ── Prefer reduced motion ──
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Dismiss tour hint after 3s ──
  useEffect(() => {
    if (activeMode !== "360") return;
    setShowTourHint(true);
    const t = setTimeout(() => setShowTourHint(false), 3000);
    return () => clearTimeout(t);
  }, [activeMode]);

  const handleNext = useCallback(() => {
    if (!assets) return;
    setCurrentIdx(prev => (prev + 1) % assets.photos.length);
  }, [assets]);

  const handlePrev = useCallback(() => {
    if (!assets) return;
    setCurrentIdx(prev => (prev - 1 + assets.photos.length) % assets.photos.length);
  }, [assets]);

  // ── Video play/pause ──
  const toggleVideo = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setVideoPlaying(true); }
    else            { vid.pause(); setVideoPlaying(false); }
  }, []);

  // ── Keyboard: Escape closes modals / lightbox ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (lightboxOpen) { setLightboxOpen(false); return; }
        if (activeSpot) { setActiveSpot(null); return; }
      }
      if (activeMode === "photos") {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }
      if (activeMode === "360") {
        if (e.key === "ArrowLeft") setDragX(prev => prev + 100);
        if (e.key === "ArrowRight") setDragX(prev => prev - 100);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, activeSpot, activeMode, handleNext, handlePrev]);

  // ── 360 drag ──
  const startDrag = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };
  const moveDrag = (clientX: number) => {
    if (!isDragging) return;
    setDragX(clientX - startXRef.current);
  };
  const endDrag = () => {
    setIsDragging(false);
    setDragX(Math.max(containerWidth - Math.max(1, panoRef.current?.offsetWidth ?? 3000), Math.min(0, dragX)));
  };

  // ── 360 clamp drag (prevent wrapping jumps) ──
  const containerWidth = panoRef.current?.parentElement?.offsetWidth ?? 1000;
  const panoWidth = Math.max(1, panoRef.current?.offsetWidth ?? 3000);
  const minDrag = containerWidth - panoWidth;
  const panOffset = Math.max(minDrag, Math.min(0, dragX));

  if (!assets) {
    return (
      <section className="bg-neutral-950 text-white/50 text-center py-32 text-sm font-light flex flex-col items-center gap-4">
        <Eye className="w-8 h-8 text-stone-600" />
        <p>Interactive media is being prepared for this project.</p>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=I%20want%20to%20see%20more%20details%20about%20this%20project.`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-primary text-xs uppercase tracking-widest hover:underline"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Request media gallery
        </a>
      </section>
    );
  }

  // ── WhatsApp CTA link ──
  const quoteLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=I%20saw%20a%20material%20on%20your%20project%20page%20and%20would%20like%20a%20quote.`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section
      id="walkthrough"
      aria-label="Explore this project — video walkthrough, virtual tour and photo gallery"
      className="bg-neutral-950 text-white relative pt-8 pb-16 px-4 md:px-12 max-w-7xl mx-auto"
    >
      {/* ── Chapter label (plain language) ── */}
      <div className="flex flex-col items-center text-center mb-10 select-none" aria-hidden="true">
        <span className="text-[10px] font-mono tracking-[0.4em] text-primary uppercase mb-2">
          02 / IMMERSE
        </span>
        <div className="w-8 h-px bg-white/10" />
      </div>

      {/* ── Mode switcher with morphing active pill ── */}
      <div className="flex justify-center mb-8" role="tablist" aria-label="View mode">
        <div className="relative flex bg-neutral-900/60 border border-white/5 rounded-full p-1 backdrop-blur-sm">
          {(
            [
              { mode: "video" as ActiveMode, icon: Video, label: "Walkthrough Video" },
              { mode: "360"   as ActiveMode, icon: Eye,   label: "360° Virtual Tour" },
              { mode: "photos"as ActiveMode, icon: ImageIcon, label: "Photo Gallery" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={activeMode === mode}
              aria-controls={`panel-${mode}`}
              id={`tab-${mode}`}
              onClick={() => { setActiveMode(mode); setActiveSpot(null); setVideoPlaying(false); }}
              className="relative flex items-center gap-2 px-4 md:px-5 py-2 text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 rounded-full z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              {/* Morphing background pill */}
              {activeMode === mode && (
                <motion.span
                  layoutId="canvasSwitcherPill"
                  className="absolute inset-0 bg-white rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 35 }}
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`w-3 h-3 shrink-0 relative z-10 transition-colors duration-200 ${
                  activeMode === mode ? "text-black" : "text-stone-400 group-hover:text-white"
                }`}
                aria-hidden="true"
              />
              <span
                className={`hidden sm:inline relative z-10 transition-colors duration-200 ${
                  activeMode === mode ? "text-black" : "text-stone-400"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main canvas ── */}
      <div
        className="w-full aspect-[4/3] md:aspect-[16/9] bg-neutral-900 border border-white/10 overflow-hidden relative rounded-2xl shadow-2xl"
        role="tabpanel"
        aria-labelledby={`tab-${activeMode}`}
        id={`panel-${activeMode}`}
      >
        <AnimatePresence mode="wait">

          {/* ──────── VIDEO MODE ──────── */}
          {activeMode === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              className="w-full h-full relative"
            >
              <video
                ref={videoRef}
                src={assets.videoUrl}
                controls
                className={`w-full h-full object-cover absolute inset-0 ${videoPlaying ? "block" : "hidden"}`}
                preload="none"
                playsInline
                muted
                loop
                aria-label="Project walkthrough video"
                onEnded={() => setVideoPlaying(false)}
              />

              {/* Poster / play state */}
              <AnimatePresence>
                {!videoPlaying && (
                  <motion.div
                    key="poster"
                    layoutId="hero-to-canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={toggleVideo}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVideo(); } }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
                      style={{ backgroundImage: `url(${assets.photos[0]})` }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                      <span className="text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase" aria-hidden="true">
                        Cinematic Story
                      </span>
                      <button
                        type="button"
                        onClick={toggleVideo}
                        aria-label="Play project walkthrough video"
                        className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-primary/90 group-hover:border-primary transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <Play className="w-8 h-8 text-white group-hover:text-black ml-1 transition-colors" aria-hidden="true" />
                      </button>
                      <p className="text-xl font-serif text-white tracking-tight text-center px-4">
                        Play Transformation Story
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Pause overlay (when playing) */}
              {videoPlaying && (
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-label="Pause video"
                  className="absolute bottom-5 right-5 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Pause className="w-4 h-4 text-white" aria-hidden="true" />
                </button>
              )}

              {/* Chapter markers — hidden when playing */}
              {!videoPlaying && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-10 pb-5 px-6"
                >
                  <ol className="flex items-center gap-5 overflow-x-auto no-scrollbar" aria-label="Video chapters">
                    {VIDEO_CHAPTERS.map((ch, i) => (
                      <li key={i} className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (videoRef.current) {
                              // We parse mm:ss from ch.time
                              const parts = ch.time.split(":");
                              const timeInSeconds = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 0;
                              videoRef.current.currentTime = timeInSeconds;
                              videoRef.current.play();
                              setVideoPlaying(true);
                            }
                          }}
                          className="flex items-center gap-2.5 group focus:outline-none"
                          aria-label={`Skip to chapter ${ch.label} at ${ch.time}`}
                        >
                          <span className="text-[10px] font-mono text-primary group-hover:text-white transition-colors">{ch.time}</span>
                          <span className="text-[10px] uppercase tracking-[0.12em] text-stone-300 font-light group-hover:text-white transition-colors">{ch.label}</span>
                        </button>
                        {i < VIDEO_CHAPTERS.length - 1 && <span className="w-5 h-px bg-white/10" />}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}

          {/* ──────── 360° TOUR MODE ──────── */}
          {activeMode === "360" && (
            <motion.div
              key="tour"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              className="w-full h-full relative overflow-hidden"
              aria-label="360 degree virtual tour — drag to pan, tap numbered markers for material details"
            >
              <div
                ref={panoRef}
                className={`w-[300%] h-full absolute top-0 left-0 bg-cover bg-center select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{
                  backgroundImage: `url(${assets.panoramic})`,
                  transform: `translateX(${panOffset}px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
                onMouseDown={e => startDrag(e.pageX)}
                onMouseMove={e => moveDrag(e.pageX)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={e => startDrag(e.touches[0].clientX)}
                onTouchMove={e => moveDrag(e.touches[0].clientX)}
                onTouchEnd={endDrag}
                role="button"
                aria-label="Panoramic view of the interior space. Use arrow keys to pan left and right."
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                {assets.hotspots.map((spot, idx) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSpot(activeSpot?.id === spot.id ? null : spot);
                    }}
                    aria-label={`View ${spot.tag} detail: ${spot.title}`}
                    aria-pressed={activeSpot?.id === spot.id}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <div className="relative flex items-center justify-center w-12 h-12 hover:scale-110 active:scale-95 transition-transform duration-200">
                      {!prefersReducedMotion && (
                        <div className={`absolute inset-1.5 rounded-full animate-ping ${activeSpot?.id === spot.id ? "bg-primary/40" : "bg-white/20"}`} />
                      )}
                      <div className={`absolute inset-3 rounded-full flex items-center justify-center shadow-lg font-bold text-[10px] transition-colors duration-300 ${
                        activeSpot?.id === spot.id ? "bg-primary text-black" : "bg-white text-black"
                      }`}>
                        {idx + 1}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showTourHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-lg pointer-events-none"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white">
                      Drag to explore · Tap numbers for materials
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swatch card popover */}
              <AnimatePresence>
                {activeSpot && (
                  <motion.div
                    ref={swatchRef}
                    key={activeSpot.id}
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ type: "spring", damping: 22, stiffness: 200 }}
                    className="absolute bottom-5 right-5 md:bottom-6 md:right-6 z-30 w-[90vw] max-w-xs md:max-w-sm bg-neutral-950/97 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Material detail: ${activeSpot.title}`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono tracking-widest text-primary uppercase">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        {activeSpot.tag}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSpot(null)}
                        aria-label="Close material detail"
                        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <X className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Image */}
                    <figure className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 mb-3 bg-neutral-900">
                      <img src={activeSpot.img} alt={activeSpot.title} className="w-full h-full object-cover" />
                      <figcaption className="sr-only">{activeSpot.title} — material detail image</figcaption>
                    </figure>

                    {/* Info */}
                    <h3 className="text-base font-serif text-white mb-1 leading-snug">{activeSpot.title}</h3>
                    <p className="text-stone-400 font-light text-[11px] leading-relaxed mb-3">{activeSpot.description}</p>

                    {/* Specs — styled list using spans */}
                    <div className="border-t border-white/5 pt-3 space-y-2 text-[10px]" role="list" aria-label="Material specifications">
                      <div role="listitem">
                        <span className="text-primary uppercase tracking-wider font-bold">Material: </span>
                        <span className="text-stone-300 font-light">{activeSpot.swatch.name} <span className="text-stone-500">({activeSpot.swatch.type})</span></span>
                      </div>
                      <div role="listitem">
                        <span className="text-stone-500 uppercase tracking-wider font-bold">Why chosen: </span>
                        <span className="text-stone-300 font-light">{activeSpot.swatch.whyChosen}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div role="listitem">
                          <span className="text-stone-500 uppercase tracking-wider font-bold text-[8px] block">Durability</span>
                          <span className="text-stone-300 font-light leading-snug block mt-0.5">{activeSpot.swatch.durability}</span>
                        </div>
                        <div role="listitem">
                          <span className="text-stone-500 uppercase tracking-wider font-bold text-[8px] block">Maintenance</span>
                          <span className="text-stone-300 font-light leading-snug block mt-0.5">{activeSpot.swatch.maintenance}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA — clear next action */}
                    <a
                      href={quoteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary text-[10px] font-semibold uppercase tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Want this in your home?
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ──────── PHOTOS MODE ──────── */}
          {activeMode === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              className="w-full h-full relative"
              role="region"
              aria-label={`Photo ${currentIdx + 1} of ${assets.photos.length}`}
            >
              <img
                src={assets.photos[currentIdx]}
                alt={`Project interior view ${currentIdx + 1} of ${assets.photos.length}`}
                className="w-full h-full object-cover select-none"
              />

              {/* Prev / Next */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 hover:border-white/40 flex items-center justify-center pointer-events-auto transition-all active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 hover:border-white/40 flex items-center justify-center pointer-events-auto transition-all active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
                </button>
              </div>

              {/* Expand */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Expand photo ${currentIdx + 1} to fullscreen`}
                className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 hover:border-white/40 flex items-center justify-center z-20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Maximize2 className="w-4 h-4 text-white" aria-hidden="true" />
              </button>

              {/* Counter */}
              <div
                className="absolute bottom-5 left-5 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-mono tracking-widest text-stone-300 z-20"
                aria-live="polite"
                aria-atomic="true"
              >
                {String(currentIdx + 1).padStart(2, "0")} / {String(assets.photos.length).padStart(2, "0")}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Filmstrip (photos mode only) ── */}
      {activeMode === "photos" && (
        <div
          className="mt-5 flex gap-3 overflow-x-auto no-scrollbar py-2 px-1"
          role="list"
          aria-label="Photo thumbnails"
        >
          {assets.photos.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              aria-label={`View picture ${idx + 1}`}
              aria-current={currentIdx === idx ? "true" : undefined}
              className={[
                "flex-shrink-0 w-24 md:w-32 aspect-[16/10] overflow-hidden rounded-lg border transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                currentIdx === idx
                  ? "border-primary shadow-md shadow-primary/20 opacity-100 scale-95"
                  : "border-white/10 opacity-70 hover:opacity-95 hover:border-white/25",
              ].join(" ")}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-50 bg-black/97 backdrop-blur-md flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen: photo ${currentIdx + 1} of ${assets.photos.length}`}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button — clearly styled */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close fullscreen view"
              className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs uppercase tracking-widest text-white font-mono transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Close <kbd className="opacity-50 text-[10px] ml-1">ESC</kbd>
            </button>

            {/* Nav within lightbox */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handlePrev(); }}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleNext(); }}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
            </button>

            <motion.img
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              src={assets.photos[currentIdx]}
              alt={`Fullscreen view ${currentIdx + 1} of ${assets.photos.length}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectExperienceCanvas;
