import { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  project?: string;
  review: string;
  rating: number;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Homeowner",
    project: "3BHK Apartment, Jamshedpur",
    review: "Crossangle Interior transformed our home beyond our expectations. Their attention to detail and creative vision made our space truly luxurious.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    project: "Corporate Office, Kolkata",
    review: "The team delivered an exceptional office design that perfectly reflects our brand identity. Professional, timely, and incredibly talented.",
    rating: 5,
  },
  {
    id: 3,
    name: "Anita Desai",
    role: "Apartment Owner",
    project: "2BHK Renovation, Jamshedpur",
    review: "From concept to completion, the entire experience was seamless. They understood our vision and executed it flawlessly.",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Restaurant Owner",
    project: "Cafe Interior, Kolkata",
    review: "Our restaurant's new interior has received countless compliments. Crossangle truly understands commercial spaces.",
    rating: 4,
  },
];

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
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      data-theme="residential"
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
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mt-6">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Real experiences from homeowners and businesses who trusted us with their spaces
          </p>
        </div>

        {/* Featured Testimonial */}
        <div
          className="max-w-4xl mx-auto mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={cn(
              "relative p-8 md:p-12 rounded-3xl backdrop-blur-lg",
              "bg-card/30 border border-gold/20",
              "transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <Quote className="absolute top-6 left-6 w-12 h-12 text-gold/20" />

            <div className="relative z-10">
              <AnimatedStars
                rating={testimonials[activeIndex].rating}
                isVisible={isVisible}
              />

              <p className="text-xl md:text-2xl text-foreground/90 mt-6 leading-relaxed italic font-light">
                "{testimonials[activeIndex].review}"
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold text-lg font-serif">
                    {testimonials[activeIndex].name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold text-lg">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {testimonials[activeIndex].role}
                  </p>
                  {testimonials[activeIndex].project && (
                    <p className="text-gold text-xs mt-1 font-medium">
                      {testimonials[activeIndex].project}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                activeIndex === index
                  ? "bg-gold w-8"
                  : "bg-muted hover:bg-gold/50"
              )}
              aria-label={`View testimonial ${index + 1}`}
              aria-current={activeIndex === index ? "true" : "false"}
            />
          ))}
        </div>

        {/* Google Reviews Badge */}
        <div
          className={cn(
            "flex justify-center mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <a
            href="https://g.page/crossangle-interior/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-card border border-border hover:border-gold/30 hover:bg-card/80 transition-all duration-300 group"
          >
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-foreground">G</span>
            </div>
            <div className="h-8 w-px bg-border group-hover:bg-gold/30 transition-colors" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-bold">4.8</span>
                <span className="text-muted-foreground text-sm">/ 5.0</span>
                <div className="flex gap-0.5 ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Based on 50+ Google reviews</p>
            </div>
          </a>
        </div>

        {/* All Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "p-6 rounded-2xl backdrop-blur-sm",
                "bg-card/20 border border-white/5",
                "hover:bg-card/40 hover:border-gold/30 hover:-translate-y-1",
                "transition-all duration-500 cursor-pointer group",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => setActiveIndex(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveIndex(index)}
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5 transition-colors duration-300",
                      testimonial.rating >= star ? "text-gold fill-gold" : "text-muted"
                    )}
                  />
                ))}
              </div>

              <p className="text-muted-foreground mt-2 text-sm line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                "{testimonial.review}"
              </p>

              <div className="mt-6 pt-4 border-t border-white/5 group-hover:border-gold/20 transition-colors">
                <h4 className="text-foreground font-medium text-sm group-hover:text-gold transition-colors">
                  {testimonial.name}
                </h4>
                <p className="text-muted-foreground/60 text-xs mt-0.5">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
