import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";


const TrustSection = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials,
  });

  const displayTestimonials = testimonials.slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplay, displayTestimonials.length]);

  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex((current) => (current + 1) % displayTestimonials.length);
  };

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex((current) => (current - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  if (isLoading) {
    return (
      <div className="container px-6 flex justify-center items-center h-48">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  if (displayTestimonials.length === 0) {
    return null;
  }

  const activeTestimonial = displayTestimonials[activeIndex];

  return (
    <div className="container mx-auto px-6 py-24 border-t border-white/5">
      <div className="mb-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-primary" />
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Client Stories</span>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl italic">
          Trusted by Homeowners & Businesses
        </h2>
      </div>

      <div className="mx-auto max-w-5xl relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-12 overflow-hidden relative">
          
          {/* Subtle Background Elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
          
          {/* Image Side */}
          <div className="md:col-span-2 relative h-64 md:h-96 rounded-xl overflow-hidden order-2 md:order-1">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
                src={'image' in activeTestimonial && typeof activeTestimonial.image === 'string' ? activeTestimonial.image : "https://ik.imagekit.io/wdrs8y61o/cross-angle/tr:q-85,f-auto,w-400/images/projects/discovery/lifestyle-1.jpg"}
                alt={activeTestimonial.author}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content Side */}
          <div className="md:col-span-3 order-1 md:order-2 flex flex-col justify-center h-full">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>

            <div className="min-h-[160px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl md:text-3xl font-light italic leading-relaxed text-white mb-8">
                    &ldquo;{activeTestimonial.quote}&rdquo;
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                      {activeTestimonial.author}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                      {activeTestimonial.role}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-12">
              <button 
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {displayTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAutoplay(false);
                      setActiveIndex(i);
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      activeIndex === i ? "bg-primary w-6" : "bg-white/20 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
              <button 
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrustSection;
