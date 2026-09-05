import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Image } from "@/components/ui/enhanced/image";
import { useGallery, useGalleryCategories } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryStackedSlider from "@/components/gallery/GalleryStackedSlider";
import { useAttentionTelemetry } from "@/hooks/useAttentionTelemetry";

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

  const heroTelemetryRef = useAttentionTelemetry<HTMLDivElement>("gallery", "hero-image", 1);
  const categoriesRef = useAttentionTelemetry<HTMLDivElement>("gallery", "category-nav", 2);
  const gridRef = useAttentionTelemetry<HTMLDivElement>("gallery", "project-grid", 3);

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

      <main id="main-content" className="home-shell min-h-screen relative w-full pb-[10vh]" data-environment="gallery">
        <div className="absolute inset-0 pointer-events-none home-noise z-0" />
        
        {/* 0–20% Scroll: Hero photography (Design Silence) */}
        <section ref={heroRef} className="relative z-10 w-full h-[70vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-transparent">
          {heroItem && (
            <motion.div ref={heroTelemetryRef} className="absolute inset-4 md:inset-8 lg:inset-12 overflow-hidden home-panel" style={{ scale: heroScale }}>
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
            <span className="home-kicker mb-4 block">Archive</span>
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
        <section ref={categoriesRef} className="sticky top-[72px] z-30 bg-[var(--s-canvas-primary)]/90 backdrop-blur-xl border-b border-[var(--s-border-subtle)]">
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
        <section ref={gridRef} className="home-section-frame relative z-10 w-full px-6 md:px-12 lg:px-24 mb-[30vh] mt-[15vh] max-w-[1600px] mx-auto flex flex-col gap-[30vh]">
          {isLoading ? (
            <div className="w-full flex justify-center py-20">
              <span className="home-kicker">Loading...</span>
            </div>
          ) : (
            <GalleryStackedSlider items={filtered} onImageClick={openLightbox} />
          )}

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-24">
              <p className="home-body text-sm uppercase tracking-widest">No projects found.</p>
            </div>
          )}
        </section>

        {/* 80–100% Scroll: CTA Transition */}
        <section className="home-section-frame relative w-full px-6 md:px-12 lg:px-24 mb-[20vh] max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center">
          <span className="home-kicker mb-8 block">Inspired?</span>
          <h2 className="font-display text-5xl md:text-7xl mb-12 text-[var(--s-text-primary)] tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Let's create your <span className="text-[var(--s-text-secondary)]">space.</span>
          </h2>
          <Link to="/contact-us" className="home-button-sweep inline-block text-[10px] uppercase tracking-[0.2em] font-bold border-b border-[#D1AF6E] pb-2 text-[var(--s-text-primary)]">
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
