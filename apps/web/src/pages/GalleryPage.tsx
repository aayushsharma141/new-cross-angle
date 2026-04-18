import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Gallery-specific components
import GalleryHero from "@/components/gallery/GalleryHero";
import MagneticFilterTabs from "@/components/gallery/MagneticFilterTabs";
import GalleryMasonryGrid from "@/components/gallery/GalleryMasonryGrid";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import CursorSpotlight from "@/components/gallery/CursorSpotlight";
import GalleryScrollIndicator from "@/components/gallery/GalleryScrollIndicator";
import GalleryCTA from "@/components/gallery/GalleryCTA";

// Gallery data hook
import { useGallery, useGalleryCategories } from "@/hooks/useGallery";

// Gallery types (for compatibility)
interface GalleryItemData {
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
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch gallery data from database
  const { data: dbItems, isLoading } = useGallery();
  const { data: categories } = useGalleryCategories();

  // Transform database items to gallery format
  const displayItems: GalleryItemData[] = useMemo(() => {
    if (!dbItems) return [];
    return dbItems.map((item) => ({
      id: item.id,
      image: item.image_url,
      category: item.category?.name || "Uncategorized",
      title: item.title,
      location: item.location || "",
      year: item.year || new Date().getFullYear(),
      description: item.description || undefined,
      slug: item.id,
    }));
  }, [dbItems]);

  // Build category list from database + "All"
  const categoryList = useMemo((): string[] => {
    const cats = categories?.map((c) => c.name) || [];
    return ["All", ...cats];
  }, [categories]);

  // Filter items
  const filteredItems =
    activeCategory === "All"
      ? displayItems
      : displayItems.filter((item) => item.category === activeCategory);

  // Count map for tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryList.forEach((cat) => {
      if (cat === "All") {
        counts[cat] = displayItems.length;
      } else {
        counts[cat] = displayItems.filter((item) => item.category === cat).length;
      }
    });
    return counts;
  }, [categoryList, displayItems]);

  const handleItemClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      setCurrentImageIndex((prev) => {
        if (direction === "prev") return prev > 0 ? prev - 1 : prev;
        return prev < filteredItems.length - 1 ? prev + 1 : prev;
      });
    },
    [filteredItems.length]
  );

  const handleIndexChange = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Lightbox-compatible items
  const lightboxItems = filteredItems.map((item) => ({
    image: item.image,
    category: item.category,
    title: item.title,
    slug: item.id,
    description: item.description,
    location: item.location,
    year: item.year,
  }));

  return (
    <>
      <Helmet>
        <title>Our Works | Cross Angle Interior — Portfolio Gallery</title>
        <meta
          name="description"
          content="Browse our portfolio of 26+ interior design projects — modular kitchens, bedrooms, living rooms, commercial spaces, and exteriors across Jamshedpur and beyond."
        />
        <meta property="og:title" content="Portfolio Gallery | Cross Angle Interior" />
        <meta
          property="og:description"
          content="26+ real interior design projects — from modular kitchens to luxury bedrooms."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/gallery" />
      </Helmet>

      <CursorSpotlight>
        <GalleryScrollIndicator />
        <FixedSocialBar />
        <Navbar />

        <main className="min-h-screen relative z-10 text-foreground">
          {/* Immersive Hero */}
          <GalleryHero totalCount={displayItems.length} categoryCount={categoryList.length - 1} />

          {/* Filter Section */}
          {isLoading ? (
            <div className="container px-4 py-12 text-center">
              <p className="text-zinc-500">Loading gallery...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="container px-4 py-12 text-center">
              <p className="text-zinc-500">No gallery items found. Add items in the admin panel.</p>
            </div>
          ) : (
            <>
              <div className="container px-4 mb-8">
                <MagneticFilterTabs
                  categories={categoryList as string[]}
                  activeCategory={activeCategory}
                  onCategoryChange={(cat) => {
                    setActiveCategory(cat);
                    setCurrentImageIndex(0);
                  }}
                  counts={categoryCounts}
                />

                {/* Filtered count indicator */}
                <div className="flex items-center justify-center mt-6">
                  <p className="text-sm tracking-widest uppercase text-[#D1AF6E]/60 font-light">
                    Showing{" "}
                    <span className="text-[#D1AF6E] font-medium">{filteredItems.length}</span>{" "}
                    of{" "}
                    <span className="text-[#D1AF6E] font-medium">{displayItems.length}</span>{" "}
                    projects
                  </p>
                </div>
              </div>

              {/* Masonry Gallery Grid */}
              <GalleryMasonryGrid
                items={filteredItems}
                onItemClick={handleItemClick}
              />

              {/* CTA Section */}
              <GalleryCTA />

              {/* Lightbox */}
              <GalleryLightbox
                isOpen={lightboxOpen}
                currentIndex={currentImageIndex}
                items={lightboxItems}
                onClose={() => setLightboxOpen(false)}
                onNavigate={handleNavigate}
                onIndexChange={handleIndexChange}
              />
            </>
          )}
        </main>

        <Footer />
        <ScrollToTop />
      </CursorSpotlight>
    </>
  );
};

export default GalleryPage;
