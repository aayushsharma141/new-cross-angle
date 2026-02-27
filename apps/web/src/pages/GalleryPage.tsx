import { Helmet } from "react-helmet-async";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import ScrollToTop from "@/components/ScrollToTop";

// Gallery-specific components
import GalleryHero from "@/components/gallery/GalleryHero";
import MagneticFilterTabs from "@/components/gallery/MagneticFilterTabs";
import GalleryMasonryGrid from "@/components/gallery/GalleryMasonryGrid";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import CursorSpotlight from "@/components/gallery/CursorSpotlight";
import GalleryScrollIndicator from "@/components/gallery/GalleryScrollIndicator";
import GalleryCTA from "@/components/gallery/GalleryCTA";
import GalleryParticles from "@/components/gallery/GalleryParticles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const categories = [
  "All",
  "Modular-Kitchen",
  "Bedroom-Interior",
  "Living-Room-Interior",
  "Commercial-Interior",
  "Exterior-Interior"
];

const galleryItems = [
  {
    category: "Modular-Kitchen",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200",
    title: "Modern Minimalist Kitchen"
  },
  {
    category: "Modular-Kitchen",
    style: "Luxury",
    image: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=1200",
    title: "Luxury White Kitchen"
  },
  {
    category: "Modular-Kitchen",
    style: "Contemporary",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
    title: "Contemporary Kitchen Design"
  },
  {
    category: "Bedroom-Interior",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200",
    title: "Master Bedroom Suite"
  },
  {
    category: "Bedroom-Interior",
    style: "Luxury",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200",
    title: "Cozy Modern Bedroom"
  },
  {
    category: "Living-Room-Interior",
    style: "Contemporary",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200",
    title: "Contemporary Living Space"
  },
  {
    category: "Living-Room-Interior",
    style: "Classic",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200",
    title: "Open Plan Living"
  },
  {
    category: "Commercial-Interior",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    title: "Modern Office Space"
  },
  {
    category: "Commercial-Interior",
    style: "Industrial",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200",
    title: "Creative Workspace"
  },
  {
    category: "Exterior-Interior",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200",
    title: "Modern Villa Exterior"
  }
];

const STYLES = ["All", "Modern", "Luxury", "Contemporary", "Classic", "Industrial"];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStyle, setActiveStyle] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredItems = galleryItems.filter(item => {
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    const matchStyle = activeStyle === "All" || item.style === activeStyle;
    return matchCategory && matchStyle;
  });

  // Calculate counts for each category
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = category === "All"
      ? galleryItems.length
      : galleryItems.filter(item => item.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  const handleItemClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentImageIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : prev;
      } else {
        return prev < filteredItems.length - 1 ? prev + 1 : prev;
      }
    });
  }, [filteredItems.length]);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Works | Cross Angle Interior - Portfolio Gallery</title>
        <meta
          name="description"
          content="Browse our portfolio of stunning interior design projects including modular kitchens, bedrooms, living rooms, commercial spaces, and exteriors."
        />
        <meta property="og:title" content="Portfolio Gallery | Cross Angle Interior" />
        <meta property="og:description" content="Browse our portfolio of stunning interior design projects." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/gallery" />
      </Helmet>

      <CursorSpotlight>
        <GalleryParticles />
        <GalleryScrollIndicator />

        <FixedSocialBar />
        <Navbar />
        <main className="min-h-screen relative z-10 text-foreground">

          {/* Immersive Hero */}
          <GalleryHero />

          {/* Magnetic Filter Tabs & Style Filter */}
          <div className="container px-4 mb-12 space-y-8">
            <MagneticFilterTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              counts={categoryCounts}
            />

            <div className="flex items-center justify-center gap-4">
              <Label className="text-muted-foreground">Filter by Style:</Label>
              <Select value={activeStyle} onValueChange={setActiveStyle}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            items={filteredItems}
            onClose={() => setLightboxOpen(false)}
            onNavigate={handleNavigate}
            onIndexChange={handleIndexChange}
          />

        </main>
        <Footer />
        <ScrollToTop />
      </CursorSpotlight>
    </>
  );
};

export default GalleryPage;
