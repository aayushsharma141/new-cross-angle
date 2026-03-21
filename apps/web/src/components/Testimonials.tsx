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
              ? "text-site-crimson fill-site-crimson scale-110"
              : "text-site-text-meta/30"
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
      <div className="absolute inset-0 bg-site-bg-section z-0" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-site-crimson text-sm uppercase tracking-[0.3em] font-medium border-b border-site-crimson/30 pb-2">
            Client Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mt-6 mb-6 text-site-text-heading relative inline-block after:content-[''] after:block after:w-12 after:h-px after:bg-site-crimson after:mx-auto after:mt-3">
            What Our Clients Say
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-site-text-muted font-light">
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
          <div className="bg-site-bg-card backdrop-blur-md border border-site-border rounded-none p-8 md:p-12 relative overflow-hidden group">


            <Quote className="absolute top-8 left-8 w-12 h-12 text-site-crimson/10" />

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

                  <p className="text-xl md:text-2xl text-site-text mt-8 mb-8 leading-relaxed italic font-light max-w-3xl">
                    "{item.content}"
                  </p>

                  <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="w-14 h-14 rounded-full bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center shadow-lg shadow-site-crimson/10">
                      <span className="text-site-crimson font-bold text-lg font-serif">
                        {item.author_name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-site-text-heading font-semibold text-lg tracking-wide">
                        {item.author_name}
                      </h4>
                      <p className="text-site-text-muted text-sm">
                        {item.role}
                      </p>
                      {item.project && (
                        <p className="text-site-crimson/80 text-xs mt-0.5 font-medium uppercase tracking-widest">
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
                    ? "w-8 bg-site-crimson shadow-lg shadow-site-crimson/30"
                    : "w-2 bg-site-text-meta/30 hover:bg-site-crimson/50"
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
