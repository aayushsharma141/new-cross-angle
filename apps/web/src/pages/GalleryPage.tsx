import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Image } from "@/components/ui/enhanced/image";
import { useGallery, useGalleryCategories } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

function useSavedItems() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem("gallery_saved");
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
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

  const [activeCategory, setActiveCategory] = useState(urlCategory || "All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Sync URL param → active category on mount / navigation
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

  const { saved, toggleSave } = useSavedItems();
  const { toast } = useToast();

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
    // Sync URL param — clear it when "All" or "Saved"
    if (cat === "All" || cat === "Saved") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  // Featured image for hero (first item or first in active category)
  const heroItem = filtered[0];

  // Lightbox items shaped for GalleryLightbox
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
        <title>Gallery | Cross Angle Interior — Spaces We've Crafted</title>
        <meta name="description" content="Explore our curated gallery of interior spaces — kitchens, bedrooms, living rooms, and commercial interiors crafted with precision." />
        <link rel="canonical" href="https://crossangleinterior.com/gallery" />
      </Helmet>

      <FixedSocialBar />
      <Navbar />

      <main className="min-h-screen bg-[#060606] text-white">
        {/* ═══ HERO — Full-bleed featured image ═══ */}
        <section ref={heroRef} className="relative h-[85vh] overflow-hidden">
          {heroItem && (
            <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060606]/60 to-transparent" />

          <motion.div
            className="absolute bottom-0 left-0 right-0 p-8 md:p-16"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-site-crimson" />
              <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Our Gallery</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-light mt-3 leading-[0.95] tracking-[-0.03em]"
            >
              Spaces We've<br />
              <span className="italic text-white/80">Crafted</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-white/50 text-sm md:text-base max-w-md"
            >
              {items.length} projects across {categoryList.length - 2} categories — each one a story of transformation.
            </motion.p>
          </motion.div>
        </section>

        {/* ═══ CATEGORY NAVIGATION ═══ */}
        <section className="sticky top-[72px] z-30 bg-[#060606]/95 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-4 py-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 min-w-max">
              {categoryList.map((cat) => {
                const count =
                  cat === "All"
                    ? items.length
                    : cat === "Saved"
                    ? saved.length
                    : items.filter((i) => i.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-medium rounded-full transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "bg-site-crimson text-white"
                        : "text-white/60 hover:text-white/70 hover:bg-white/5"
                    )}
                  >
                    {cat}
                    <span className={cn("ml-2 text-[9px]", isActive ? "text-white/70" : "text-white/20")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ GALLERY GRID — Staggered masonry ═══ */}
        {isLoading ? (
          <div className="container mx-auto px-4 py-20">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`skeleton-shimmer rounded-sm mb-2 break-inside-avoid ${
                    i % 4 === 0
                      ? "aspect-[3/4]"
                      : i % 4 === 1
                      ? "aspect-square"
                      : i % 4 === 2
                      ? "aspect-[4/5]"
                      : "aspect-[3/4]"
                  }`}
                  style={{ animationDelay: `${Math.min(i * 50, 450)}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ═══ STYLE QUIZ PROMO ═══ */}
            <div className="container mx-auto px-4 mt-8 mb-4">
              <div className="bg-site-crimson/10 border border-site-crimson/20 rounded-md p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-white text-sm md:text-base font-medium">Not sure what your exact style is?</h3>
                  <p className="text-white/60 text-xs md:text-sm mt-1">Discover your design DNA in 3 minutes.</p>
                </div>
                <Link to="/aesthetic-discovery-engine">
                  <button className="px-6 py-2.5 bg-site-crimson text-white text-[10px] uppercase tracking-[0.2em] font-semibold rounded hover:bg-site-crimson/90 transition-colors whitespace-nowrap">
                    Take the Quiz
                  </button>
                </Link>
              </div>
            </div>

            <section className="container mx-auto px-2 md:px-4 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="columns-2 md:columns-3 lg:columns-4 gap-2 [column-fill:_balance]"
                >
                  {filtered.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: Math.min(idx * 0.04, 0.25) }}
                      className="break-inside-avoid mb-2 group relative overflow-hidden cursor-pointer rounded-sm"
                      onClick={() => openLightbox(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${item.title}`}
                      onKeyDown={(e) => { if (e.key === "Enter") openLightbox(idx); }}
                    >
                      <div className={cn(
                        "relative overflow-hidden",
                        idx === 0 ? "aspect-[3/4]" : idx % 7 === 1 ? "aspect-square" : idx % 7 === 3 ? "aspect-[4/5]" : "aspect-[3/4]"
                      )}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full pointer-events-none"
                          imageClassName="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                          draggable={false}
                          loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Heart Save Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.id);
                            if (!saved.includes(item.id)) {
                              toast({ title: "Saved", description: "Image added to your Inspiration Board.", duration: 2500 });
                            }
                          }}
                          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                          aria-label="Save to moodboard"
                        >
                          <Heart className={cn("w-4 h-4 transition-colors", saved.includes(item.id) ? "fill-site-crimson text-site-crimson" : "text-white")} />
                        </button>

                        <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-site-crimson font-medium">{item.category}</span>
                          <h3 className="text-sm font-medium text-white mt-1 line-clamp-2">{item.title}</h3>
                          {item.location && (
                            <span className="text-[10px] text-white/50 mt-0.5">{item.location}{item.year ? ` · ${item.year}` : ""}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="text-center py-24">
                  {activeCategory === "Saved" ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-medium mb-2">Your Inspiration Board is empty</h3>
                      <p className="text-white/60 text-sm mb-6">Tap the heart icon on any image to save it here.</p>
                      <button onClick={() => handleCategoryChange("All")} className="px-6 py-2 border border-white/10 text-white/70 text-xs uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors">
                        Explore Gallery
                      </button>
                    </motion.div>
                  ) : (
                    <p className="text-white/60 text-sm">No projects in this category yet.</p>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* ═══ CTA SECTION ═══ */}
        <section className="py-24 md:py-32 border-t border-white/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-site-crimson" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-site-gold">Inspired?</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-light mt-4 mb-6">
              Let's create your <span className="italic">space</span>.
            </h2>
            <p className="text-white/50 text-sm mb-10 max-w-md mx-auto">
              Every project in this gallery started with a single conversation. Yours could be next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/estimate">
                <button className="px-8 py-3.5 bg-site-crimson text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-site-crimson/90 transition-colors">
                  Get Free Estimate
                </button>
              </Link>
              <Link to="/contact-us">
                <button className="px-8 py-3.5 border border-white/15 text-white/60 text-xs uppercase tracking-[0.2em] rounded-full hover:border-white/30 hover:text-white transition-all">
                  Book Consultation
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ GALLERY LIGHTBOX — upgraded component ═══ */}
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
