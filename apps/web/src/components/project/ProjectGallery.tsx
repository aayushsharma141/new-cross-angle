import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Maximize2, RotateCw, Image as ImageIcon, Video, Eye, ArrowDown } from "lucide-react";
import { useParams } from "react-router-dom";
import { getOptimizedUrl } from "@/lib/cdn";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

const img = (src: string, width = 1200) => getOptimizedUrl(src, { width, quality: 80 });

interface ProjectGalleryProps {
  gallery: { room: string; images: string[] }[];
  title: string;
}

// Curated high-fidelity assets for mock projects
const projectAssets: Record<string, {
  photos: string[];
  details: { label: string; desc: string; img: string }[];
  videoUrl: string;
  panoramics: string[];
}> = {
  "serene-master-suite": {
    photos: [
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
      img(portfolioBedroom, 1200),
    ],
    details: [
      { label: "01 / TEXTURE", desc: "Premium Belgian linens providing deep sensory warmth.", img: img(portfolioBedroom, 600) },
      { label: "02 / JUNCTION", desc: "Flush shadowline junctions between oak and natural plaster.", img: img(portfolioBedroom, 600) }
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramics: [img(portfolioBedroom, 1920)]
  },
  "modern-culinary-space": {
    photos: [
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
      img(portfolioKitchen, 1200),
    ],
    details: [
      { label: "01 / FLUTED PANEL", desc: "Diffusing glass panels allowing sunlight pathways through zones.", img: img(portfolioKitchen, 600) },
      { label: "02 / HARDWARE", desc: "German soft-close drawer tracks demonstrating structural alignment.", img: img(portfolioKitchen, 600) }
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramics: [img(portfolioKitchen, 1920)]
  },
  "executive-workspace": {
    photos: [
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
      img(portfolioOffice, 1200),
    ],
    details: [
      { label: "01 / TIMBER SLATS", desc: "White oak slats controlling sound frequencies.", img: img(portfolioOffice, 600) },
      { label: "02 / ACOUSTIC PANEL", desc: "Deep grey felt absorbers positioned to deaden room noise.", img: img(portfolioOffice, 600) }
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-walkthrough-44342-large.mp4",
    panoramics: [img(portfolioOffice, 1920)]
  }
};

const ProjectGallery = ({ gallery, title }: ProjectGalleryProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [activeMode, setActiveMode] = useState<"photos" | "video" | "360">("photos");

  const activeSlug = slug || "serene-master-suite";
  const assets = projectAssets[activeSlug] || projectAssets["serene-master-suite"];

  const imagesList = assets.photos;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Parallax hook declarations for the massive hero image transition
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  // Drag coordinates for simulated 360 virtual tour
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const panoRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % imagesList.length);
  };
  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  // Drag event bindings
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - dragX;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragX(e.pageX - startX.current);
  };
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX - dragX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragX(e.touches[0].clientX - startX.current);
  };

  return (
    <div ref={sectionRef} className="bg-neutral-950 text-white relative">
      
      {/* 1. RHYTHM PEAK 01: Massive Parallax Cover (BIG) */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <motion.div 
          className="absolute inset-0 w-full h-[120%]"
          style={{ y: parallaxY }}
        >
          <img 
            src={imagesList[0]} 
            alt={`${title} main showcase`} 
            className="w-full h-full object-cover opacity-85"
          />
        </motion.div>
        
        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />
        
        {/* Floating captions over image */}
        <div className="absolute bottom-12 left-6 md:left-24 max-w-lg z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] font-mono tracking-[0.3em] text-site-gold uppercase block mb-3">01 / IMMERSIVE VIEW</span>
            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed drop-shadow-lg font-light">
              &ldquo;A sanctuary of clean lines and soft ambient reflections.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>

      {/* 2. RHYTHM PEAK 02: Staggered Detail Cards (TINY/SMALL details) */}
      <div className="py-24 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 space-y-6">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-site-gold block">— THE GRAIN & DETAILS</span>
          <h3 className="text-2xl md:text-4xl font-serif text-white font-normal">
            Visualizing <span className="italic text-site-crimson font-light">Tactility</span>
          </h3>
          <p className="text-stone-400 font-light text-sm leading-relaxed max-w-md">
            True luxury resides in the details. We design shadowlines and grain transitions to feel completely natural yet visually calculated.
          </p>
        </div>

        {/* Staggered offset images */}
        <div className="md:col-span-7 grid grid-cols-2 gap-6 relative">
          {assets.details.map((detail, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: idx === 1 ? 40 : -20 }}
              whileInView={{ opacity: 1, y: idx === 1 ? 20 : 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`relative overflow-hidden bg-neutral-900 border border-white/10 rounded-lg aspect-[3/4] ${
                idx === 1 ? "top-12" : ""
              }`}
            >
              <img src={detail.img} alt={detail.label} className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-site-gold block mb-1">{detail.label}</span>
                <p className="text-xs text-stone-300 font-light leading-snug">{detail.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spacing element to balance the staggered layout offset */}
      <div className="h-16" />

      {/* 3. RHYTHM PEAK 03: The Interactive Media Reel (BIG/SLIDER) */}
      <div className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-semibold tracking-[0.35em] uppercase text-site-gold block mb-4">— INTERACTIVE PLAYBOOK</span>
              <h3 className="text-2xl md:text-4xl font-serif text-white">
                Walkthrough <span className="italic text-site-crimson font-light">Journey</span>
              </h3>
            </div>

            {/* Switchers */}
            <div className="inline-flex bg-neutral-900/90 border border-white/10 p-1.5 rounded-full backdrop-blur-md">
              <button 
                onClick={() => setActiveMode("photos")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeMode === "photos" ? "bg-white text-black shadow-lg" : "text-stone-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                Photos ({imagesList.length})
              </button>
              <button 
                onClick={() => setActiveMode("video")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeMode === "video" ? "bg-white text-black shadow-lg" : "text-stone-400 hover:text-white"
                }`}
              >
                <Video className="w-3 h-3" />
                Video Loop
              </button>
              <button 
                onClick={() => setActiveMode("360")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeMode === "360" ? "bg-white text-black shadow-lg" : "text-stone-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                360° View
              </button>
            </div>
          </div>

          {/* Main Visual showcase frame */}
          <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-neutral-900 border border-white/10 overflow-hidden relative rounded-xl shadow-2xl">
            <AnimatePresence mode="wait">
              {activeMode === "photos" && (
                <motion.div 
                  key="photos-showcase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe < -10000 || offset.x < -50) handleNext();
                    else if (swipe > 10000 || offset.x > 50) handlePrev();
                  }}
                >
                  <img src={imagesList[currentIdx]} alt="Carousel slide" className="w-full h-full object-cover select-none" />

                  {/* Left/Right Controls */}
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between items-center z-25 pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                      className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/30 flex items-center justify-center pointer-events-auto transition-all active:scale-95"
                      aria-label="Previous Image"
                      title="Previous"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/30 flex items-center justify-center pointer-events-auto transition-all active:scale-95"
                      aria-label="Next Image"
                      title="Next"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <button 
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/30 flex items-center justify-center transition-all z-20"
                    aria-label="Expand image to fullscreen"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>

                  <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-mono tracking-widest text-stone-300 z-20">
                    {String(currentIdx + 1).padStart(2, '0')} / {String(imagesList.length).padStart(2, '0')}
                  </div>
                </motion.div>
              )}

              {activeMode === "video" && (
                <motion.div key="video-showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <video src={assets.videoUrl} className="w-full h-full object-cover" controls autoPlay muted loop playsInline />
                </motion.div>
              )}

              {activeMode === "360" && (
                <motion.div
                  key="360-showcase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUpOrLeave}
                  ref={panoRef}
                >
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/35 text-center z-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center mb-3">
                      <RotateCw className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                      Drag left or right to explore space
                    </span>
                  </div>

                  <div 
                    className="w-[300%] h-full absolute top-0 left-0 bg-cover bg-center transition-transform duration-75 pointer-events-none"
                    style={{
                      backgroundImage: `url(${assets.panoramics[0]})`,
                      transform: `translateX(${(dragX % (panoRef.current?.offsetWidth || 1920))}px)`
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cinematic film strip thumbs */}
          {activeMode === "photos" && (
            <div className="mt-8 flex gap-4 overflow-x-auto no-scrollbar py-3 px-1 border-t border-b border-white/5 bg-neutral-900/35">
              {imagesList.map((img, idx) => {
                const isVideoNode = idx === 2 || idx === 6 || idx === 10;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex-shrink-0 w-32 md:w-44 aspect-[16/10] overflow-hidden rounded-lg border transition-all duration-500 relative group/thumb ${
                      currentIdx === idx ? "border-site-gold scale-95 shadow-lg shadow-site-gold/15 opacity-100" : "border-white/10 opacity-50 hover:opacity-90 hover:border-white/20"
                    }`}
                    aria-label={`View Slide ${idx + 1} ${isVideoNode ? '(Video)' : '(Photo)'}`}
                  >
                    <img src={img} alt="Film strip thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105" />
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase text-stone-400">
                      {isVideoNode ? "Video" : "Photo"}
                    </div>
                    {isVideoNode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/45 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center group-hover/thumb:bg-site-gold/90 group-hover/thumb:border-site-gold transition-all duration-300">
                          <Play className="w-3.5 h-3.5 text-white group-hover/thumb:text-black ml-0.5" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
          >
            <div 
              className="absolute inset-0 overflow-auto flex items-center justify-center p-6 cursor-zoom-out" 
              onClick={() => setLightboxOpen(false)}
            >
              <button className="absolute top-8 right-8 text-white/60 hover:text-white text-xs uppercase tracking-widest font-mono z-50">
                Close [ESC]
              </button>
              <motion.img 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={imagesList[currentIdx]} 
                alt="Expanded view" 
                className="w-auto max-w-full md:max-w-none max-h-none md:max-h-[85vh] object-contain border border-white/10 shadow-2xl rounded-lg"
                onClick={(e) => {
                  // allow pinch zoom to work without closing on mobile if they tap the image
                  e.stopPropagation();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProjectGallery;
