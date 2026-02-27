import { useState } from "react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { cn } from "@/lib/utils";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

// Sample transformation data - in production, these would be actual before/after pairs
const transformations = [
  {
    id: 1,
    title: "Master Bedroom Makeover",
    location: "Jamshedpur",
    beforeImage: portfolioOffice, // Using different images as placeholders
    afterImage: portfolioBedroom,
    description: "Complete transformation from dated to contemporary luxury",
  },
  {
    id: 2,
    title: "Kitchen Renovation",
    location: "Kolkata",
    beforeImage: portfolioBedroom,
    afterImage: portfolioKitchen,
    description: "Modern minimalist kitchen with smart storage solutions",
  },
  {
    id: 3,
    title: "Office Space Upgrade",
    location: "Jamshedpur",
    beforeImage: portfolioKitchen,
    afterImage: portfolioOffice,
    description: "Professional workspace designed for productivity",
  },
];

export const BeforeAfterShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Transformations
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            See the <span className="text-primary">Difference</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Drag the slider to witness the remarkable transformations we've achieved for our clients
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Slider */}
          <div className="lg:col-span-2">
            <BeforeAfterSlider
              beforeImage={transformations[activeIndex].beforeImage}
              afterImage={transformations[activeIndex].afterImage}
              className="shadow-2xl"
            />

            {/* Project Info */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {transformations[activeIndex].title}
                </h3>
                <p className="text-muted-foreground">
                  {transformations[activeIndex].location}
                </p>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {transformations[activeIndex].description}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-4">
            <h4 className="hidden lg:block text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              More Projects
            </h4>
            {transformations.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative flex-1 lg:flex-none overflow-hidden rounded-lg transition-all duration-300",
                  "aspect-[4/3] lg:aspect-video",
                  "group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  activeIndex === index
                    ? "ring-2 ring-primary shadow-lg scale-105 lg:scale-100"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={item.afterImage}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent",
                    "flex items-end p-3 transition-opacity",
                    activeIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <span className="text-xs font-medium text-foreground truncate">
                    {item.title}
                  </span>
                </div>
                {/* Active Indicator */}
                {activeIndex === index && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
