import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Image } from "@/components/ui/enhanced/image";
import { useGallery, useGalleryCategories } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

function useSavedItems(urlBoardIds: string[]) {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem("gallery_saved");
      const local = item ? JSON.parse(item) : [];
      if (urlBoardIds.length > 0) {
        const merged = Array.from(new Set([...local, ...urlBoardIds]));
        window.localStorage.setItem("gallery_saved", JSON.stringify(merged));
        return merged;
      }
      return local;
    } catch {
      return urlBoardIds;
    }
  });

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((i) => i !== id) : [...prev, id];
      window.localStorage.setItem("gallery_saved", JSON.stringify(next));
      return next;
    });
  };

  return { saved, toggleSave };
}

interface GalleryItem {
  id: string;
  image: string;
  category: string;
  title: string;
  location: string;
  year: number;
  description?: string;
  slug?: string;
}

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlBoard = searchParams.get("board");
  const urlBoardIds = useMemo(() => urlBoard ? urlBoard.split(",") : [], [urlBoard]);

  const [activeCategory, setActiveCategory] = useState(urlCategory || (urlBoard ? "Saved" : "All"));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const { data: dbItems, isLoading } = useGallery();
  const { data: categories } = useGalleryCategories();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const items: GalleryItem[] = useMemo(() => {
    if (!dbItems) return [];
    return dbItems.map((item) => ({
      id: item.id,
      image: item.image_url,
      category: item.category?.name || "Uncategorized",
      title: item.title,
      location: item.location || "",
      year: item.year || new Date().getFullYear(),
      description: item.description || undefined,
      slug: undefined,
    }));
  }, [dbItems]);

  const categoryList = useMemo(() => {
    const cats = categories?.map((c) => c.name) || [];
    return ["All", "Saved", ...cats];
  }, [categories]);

  const { saved } = useSavedItems(urlBoardIds);
  const { toast } = useToast();

  useEffect(() => {
    if (urlBoard && urlBoardIds.length > 0) {
      toast({ title: "Inspiration Board Loaded", description: `Imported items from shared link.`, duration: 3000 });
      const params = new URLSearchParams(searchParams);
      params.delete("board");
      setSearchParams(params, { replace: true });
    }
  }, [urlBoard, urlBoardIds.length, searchParams, setSearchParams, toast]);

  const filtered = activeCategory === "All"
    ? items
    : activeCategory === "Saved"
    ? items.filter(i => saved.includes(i.id))
    : items.filter((i) => i.category === activeCategory);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLightbox = useCallback(
    (dir: "prev" | "next") => {
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        if (dir === "prev") return prev > 0 ? prev - 1 : filtered.length - 1;
        return prev < filtered.length - 1 ? prev + 1 : 0;
      });
    },
    [filtered.length]
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All" || cat === "Saved") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  const heroItem = filtered[0];

  const lightboxItems = useMemo(
    () =>
      filtered.map((item) => ({
        image: item.image,
        category: item.category,
        title: item.title,
        location: item.location,
        year: item.year,
        description: item.description,
        slug: item.slug,
      })),
    [filtered]
  );

  return (
    <>
      <Helmet>
        <title>Gallery | Crossangle Interior</title>
      </Helmet>

      <Navbar />

      <main id="main-content" className="min-h-screen bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]" data-environment="gallery">
        
        {/* 0–20% Scroll: Hero photography (Design Silence) */}
        <section ref={heroRef} className="relative w-full h-[70vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-[var(--s-canvas-primary)]">
          {heroItem && (
            <motion.div className="absolute inset-4 md:inset-8 lg:inset-12 overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)]" style={{ scale: heroScale }}>
              <Image
                src={heroItem.image}
                alt={heroItem.title}
                className="w-full h-full"
                imageClassName="object-cover"
                loading="eager"
                draggable={false}
              />
            </motion.div>
          )}

          <motion.div
            className="absolute bottom-16 md:bottom-24 lg:bottom-32 left-8 md:left-16 lg:left-24"
            style={{ opacity: heroOpacity }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--s-text-tertiary)] mb-4 block">Archive</span>
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl text-[var(--s-text-primary)] tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Spaces We've<br />
              <span className="text-[var(--s-text-secondary)]">Crafted.</span>
            </motion.h1>
          </motion.div>
        </section>

        {/* 20–35% Scroll: Category Navigation (Asymmetric sticky) */}
        <section className="sticky top-[72px] z-30 bg-[var(--s-canvas-primary)]/90 backdrop-blur-xl border-b border-[var(--s-border-subtle)]">
          <div className="container mx-auto px-6 md:px-12 py-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-6 min-w-max">
              {categoryList.map((cat) => {
                const count = cat === "All" ? items.length : cat === "Saved" ? saved.length : items.filter((i) => i.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "text-[10px] uppercase tracking-[0.15em] font-bold transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "text-[var(--s-text-primary)] border-b border-[var(--s-text-primary)] pb-1"
                        : "text-[var(--s-text-tertiary)] hover:text-[var(--s-text-secondary)] pb-1"
                    )}
                  >
                    {cat}
                    <span className={cn("ml-2 text-[9px] font-medium", isActive ? "text-[var(--s-text-secondary)]" : "text-[var(--s-text-tertiary)]")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 35–80% Scroll: Asymmetric Gallery Grid */}
        <section className="px-6 md:px-12 lg:px-24 py-[15vh] max-w-[1600px] mx-auto flex flex-col gap-[15vh]">
          {isLoading ? (
            <div className="w-full flex justify-center py-20">
              <span className="text-[var(--s-text-tertiary)] text-xs tracking-widest uppercase">Loading...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filtered.map((item, idx) => {
                // Editorial asymmetry: alternating alignment
                const alignLeft = idx % 2 === 0;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex flex-col ${alignLeft ? 'md:items-start' : 'md:items-end'} w-full`}
                  >
                    <div className={`w-full md:w-8/12 lg:w-7/12 flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}>
                      <div 
                        className="w-full aspect-[4/5] md:aspect-[3/2] relative cursor-pointer overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)]"
                        onClick={() => openLightbox(idx)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${item.title}`}
                        onKeyDown={(e) => { if (e.key === "Enter") openLightbox(idx); }}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full pointer-events-none"
                          imageClassName="object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.02]"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      
                      <div className={`mt-8 max-w-sm ${alignLeft ? 'text-left' : 'text-right'}`}>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] mb-4 block">
                          {String(idx + 1).padStart(2, '0')} / {item.category}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl text-[var(--s-text-primary)] tracking-tight">
                          {item.title}
                        </h3>
                        {item.location && (
                          <p className="font-sans text-[var(--s-text-secondary)] text-xs mt-3 leading-relaxed">
                            {item.location}{item.year ? ` · ${item.year}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-24">
              <p className="text-[var(--s-text-secondary)] text-sm uppercase tracking-widest">No projects found.</p>
            </div>
          )}
        </section>

        {/* 80–100% Scroll: CTA Transition */}
        <section className="relative w-full px-6 md:px-12 lg:px-24 pb-[15vh] max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--s-text-tertiary)] mb-8 block">Inspired?</span>
          <h2 className="font-display text-5xl md:text-7xl mb-12 text-[var(--s-text-primary)] tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Let's create your <span className="text-[var(--s-text-secondary)]">space.</span>
          </h2>
          <Link to="/contact-us" className="inline-block text-xs uppercase tracking-[0.2em] font-bold border-b border-[var(--s-text-primary)] pb-1 text-[var(--s-text-primary)] transition-opacity hover:opacity-70">
            Book Consultation
          </Link>
        </section>

      </main>

      <GalleryLightbox
        isOpen={lightboxIndex !== null}
        currentIndex={lightboxIndex ?? 0}
        items={lightboxItems}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
        onIndexChange={setLightboxIndex}
      />

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default GalleryPage;
