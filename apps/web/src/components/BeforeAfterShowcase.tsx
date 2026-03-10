import { useState } from "react";
import { Compare } from "@/components/ui/compare";
import { cn } from "@/lib/utils";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    <section className="py-8 md:py-12 bg-background relative overflow-hidden h-[100dvh] flex flex-col justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col h-full max-h-[1000px]">
        {/* Section Header */}
        <div className="text-center shrink-0 mb-4 lg:mb-6 mt-16 md:mt-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-2 lg:mb-3">
            Transformations
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 lg:mb-3">
            See the <span className="text-primary">Difference</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
            Drag the slider to witness the remarkable transformations we've achieved for our clients
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-4 lg:gap-6 mx-auto w-full max-w-6xl flex-1 min-h-0">
          {/* Slider */}
          <div className="w-full flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 relative shadow-2xl rounded-2xl md:rounded-[2rem] overflow-hidden border border-border/10">
              <Compare
                firstImage={transformations[activeIndex].beforeImage}
                secondImage={transformations[activeIndex].afterImage}
                className="w-full h-full relative"
                slideMode="hover"
              />
            </div>

            {/* Project Info */}
            <div className="shrink-0 mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-2">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground leading-tight">
                  {transformations[activeIndex].title}
                </h3>
                <p className="text-muted-foreground text-xs lg:text-sm mt-0.5">
                  {transformations[activeIndex].location}
                </p>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground max-w-xs sm:text-right hidden sm:block">
                {transformations[activeIndex].description}
              </p>
            </div>
          </div>

          {/* Thumbnails Carousel */}
          <div className="shrink-0 mx-auto w-full max-w-4xl px-12 lg:px-16 pb-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {transformations.map((item, index) => (
                  <CarouselItem key={item.id} className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "relative w-full overflow-hidden rounded-xl transition-all duration-300",
                        "aspect-[16/9]",
                        "group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                        activeIndex === index
                          ? "ring-2 ring-primary shadow-lg scale-100"
                          : "opacity-60 hover:opacity-100 scale-[0.98] hover:scale-100"
                      )}
                    >
                      <img
                        src={item.afterImage}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent",
                          "flex items-end p-3 transition-opacity duration-300",
                          activeIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <span className="text-xs lg:text-sm font-semibold text-foreground truncate drop-shadow-md">
                          {item.title}
                        </span>
                      </div>
                      {/* Active Indicator */}
                      {activeIndex === index && (
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm" />
                      )}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-background/80 backdrop-blur-sm shadow-sm" />
              <CarouselNext className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-background/80 backdrop-blur-sm shadow-sm" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};
