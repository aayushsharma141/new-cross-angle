import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useGallery, useGalleryCategories } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryMasonry, { type MasonryItem } from "@/components/gallery/GalleryMasonry";
import { useAttentionTelemetry } from "@/hooks/useAttentionTelemetry";
import { Container, Section, Eyebrow, DisplayHeading, Body, Em, reveal, EASE_OUT_EXPO } from "@/components/editorial";

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

interface GalleryItem extends MasonryItem {
  description?: string;
  slug?: string;
}

/**
 * Gallery — filter row over a grouped masonry.
 *
 * With "All" active the archive is grouped by category, each group carrying
 * its own heading and count; a specific category renders one masonry.
 */
const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlBoard = searchParams.get("board");
  const urlBoardIds = useMemo(() => urlBoard ? urlBoard.split(",") : [], [urlBoard]);

  const [activeCategory, setActiveCategory] = useState(urlCategory || (urlBoard ? "Saved" : "All"));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const headerRef = useAttentionTelemetry<HTMLDivElement>("gallery", "hero-image", 1);
  const categoriesRef = useAttentionTelemetry<HTMLDivElement>("gallery", "category-nav", 2);
  const gridRef = useAttentionTelemetry<HTMLDivElement>("gallery", "project-grid", 3);

  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const { data: dbItems, isLoading } = useGallery();
  const { data: categories } = useGalleryCategories();

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

  const filtered = useMemo(() => (
    activeCategory === "All"
      ? items
      : activeCategory === "Saved"
      ? items.filter((i) => saved.includes(i.id))
      : items.filter((i) => i.category === activeCategory)
  ), [activeCategory, items, saved]);

  /** Groups for the "All" view; a single unnamed group otherwise. */
  const groups = useMemo(() => {
    if (activeCategory !== "All") return [{ name: null, items: filtered }];
    const byCategory = new Map<string, GalleryItem[]>();
    filtered.forEach((item) => {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    });
    return [...byCategory.entries()].map(([name, groupItems]) => ({ name, items: groupItems }));
  }, [activeCategory, filtered]);

  const indexOf = useCallback((item: MasonryItem) => filtered.findIndex((i) => i.id === item.id), [filtered]);

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
        <meta
          name="description"
          content="Browse the Cross Angle Interior gallery — living rooms, bedrooms, kitchens and workspaces from delivered turn-key projects across Jamshedpur."
        />
        <link rel="canonical" href="https://crossangleinterior.com/gallery" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white" data-environment="gallery">
        {/* Header */}
        <Container className="pt-36 pb-14 md:pt-48 md:pb-20">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            className="max-w-3xl"
          >
            <Eyebrow className="mb-8">The archive</Eyebrow>
            <DisplayHeading as="h1" size="lg" className="mb-6">
              Spaces we've <Em>crafted.</Em>
            </DisplayHeading>
            <Body className="max-w-xl">
              Rooms from delivered projects — photographed as built, not staged. Open any frame for the full view.
            </Body>
          </motion.div>
        </Container>

        {/* Filters */}
        <Container>
          <div
            ref={categoriesRef}
            className="sticky top-[72px] z-30 -mx-6 flex items-center gap-x-8 overflow-x-auto whitespace-nowrap border-b border-white/10 bg-[var(--s-canvas-primary)]/90 px-6 py-5 backdrop-blur-xl [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {categoryList.map((cat) => {
              const count = cat === "All"
                ? items.length
                : cat === "Saved"
                ? saved.length
                : items.filter((i) => i.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative shrink-0 py-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors duration-300",
                    "focus-visible:outline-none focus-visible:text-primary",
                    isActive ? "text-white" : "text-white/40 hover:text-white",
                  )}
                >
                  {cat}
                  <span className={cn("ml-2 text-[9px] tabular-nums", isActive ? "text-primary" : "text-white/25")}>
                    {count}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="galleryFilterUnderline"
                      aria-hidden="true"
                      className="absolute -bottom-[21px] left-0 h-px w-full bg-primary"
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Container>

        {/* Grouped masonry */}
        <Section spacing="default">
          <div ref={gridRef}>
          {isLoading ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3" aria-busy="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="mb-6 aspect-[4/3] w-full animate-pulse break-inside-avoid bg-white/[0.03]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-24 text-center font-display text-xl font-light italic text-white/40">
              {activeCategory === "Saved" ? "Nothing saved yet." : "No projects found."}
            </p>
          ) : (
            <div className="flex flex-col gap-20 md:gap-28">
              {groups.map((group) => (
                <section key={group.name ?? "all"}>
                  {group.name && (
                    <motion.div {...reveal()} className="mb-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-white/10 pb-5">
                      <DisplayHeading as="h2" size="sm">{group.name}</DisplayHeading>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 tabular-nums">
                        {group.items.length} {group.items.length === 1 ? "work" : "works"}
                      </span>
                    </motion.div>
                  )}
                  <GalleryMasonry items={group.items} indexOf={indexOf} onImageClick={openLightbox} />
                </section>
              ))}
            </div>
          )}
          </div>
        </Section>
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
