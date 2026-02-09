import { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const Testimonials = () => {
  return (
    <section
      id="testimonials"
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
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mt-6">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Real experiences from homeowners and businesses who trusted us with their spaces
          </p>
        </div>

        {/* TrustIndex Widget */}
        <div className="w-full max-w-6xl mx-auto min-h-[450px] bg-card/10 rounded-2xl overflow-hidden border border-white/5">
          <iframe
            src="https://cdn.trustindex.io/amp-widget.html#e8785bc644bf2988e2766423f85"
            title="TrustIndex Reviews"
            className="w-full h-[500px] border-none"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
