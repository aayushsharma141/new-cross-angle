import { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: number;
  author_name: string;
  role: string;
  project?: string;
  content: string;
  rating: number;
  image_url?: string;
}

const AnimatedStars = ({ rating, isVisible }: { rating: number; isVisible: boolean }) => {
  const [animatedRating, setAnimatedRating] = useState(0);

  useEffect(() => {
    if (isVisible) {
      let current = 0;
      const interval = setInterval(() => {
        current += 0.5;
        setAnimatedRating(Math.min(current, rating));
        if (current >= rating) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isVisible, rating]);

  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-5 h-5 transition-all duration-300",
            animatedRating >= star
              ? "text-primary fill-primary scale-110"
              : "text-muted-foreground/30"
          )}
          style={{
            transitionDelay: `${star * 100}ms`,
            transform: animatedRating >= star ? "scale(1.1)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
};

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
      }
      return data as Testimonial[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fallback data if DB is empty to maintain UI
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: 1,
      author_name: "Priya Sharma",
      role: "Homeowner",
      project: "3BHK Apartment, Jamshedpur",
      content: "Crossangle Interior transformed our home beyond our expectations. Their attention to detail and creative vision made our space truly luxurious.",
      rating: 5,
    },
    {
      id: 2,
      author_name: "Rajesh Kumar",
      role: "Business Owner",
      project: "Corporate Office, Kolkata",
      content: "The team delivered an exceptional office design that perfectly reflects our brand identity. Professional, timely, and incredibly talented.",
      rating: 5,
    },
    {
      id: 3,
      author_name: "Anita Desai",
      role: "Apartment Owner",
      project: "2BHK Renovation, Jamshedpur",
      content: "From concept to completion, the entire experience was seamless. They understood our vision and executed it flawlessly.",
      rating: 5,
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, displayTestimonials.length]);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Dark overlay with Gold tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(46_70%_47%/0.05)_0%,transparent_70%)] z-0" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold text-sm uppercase tracking-[0.3em] font-medium border-b border-gold/30 pb-2">
            Client Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-6 mb-6 text-gradient-gold">
            What Our Clients Say
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-light">
            Real stories from homeowners and businesses we've had the privilege to work with.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Card */}
          <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 rounded-tr-full -ml-12 -mb-12 transition-transform group-hover:scale-110 duration-700" />

            <Quote className="absolute top-8 left-8 w-12 h-12 text-gold/20" />

            <div className="relative z-10 min-h-[300px] flex items-center justify-center">
              {displayTestimonials.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out px-4",
                    index === activeIndex
                      ? "opacity-100 translate-x-0 scale-100"
                      : index < activeIndex
                        ? "opacity-0 -translate-x-full scale-95 pointer-events-none"
                        : "opacity-0 translate-x-full scale-95 pointer-events-none"
                  )}
                >
                  <AnimatedStars
                    rating={item.rating}
                    isVisible={index === activeIndex}
                  />

                  <p className="text-xl md:text-2xl text-foreground/90 mt-8 mb-8 leading-relaxed italic font-light max-w-3xl">
                    "{item.content}"
                  </p>

                  <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                      <span className="text-gold font-bold text-lg font-serif">
                        {item.author_name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-foreground font-semibold text-lg tracking-wide">
                        {item.author_name}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {item.role}
                      </p>
                      {item.project && (
                        <p className="text-gold/80 text-xs mt-0.5 font-medium uppercase tracking-wider">
                          {item.project}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 gap-3">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-8 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-gold/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
