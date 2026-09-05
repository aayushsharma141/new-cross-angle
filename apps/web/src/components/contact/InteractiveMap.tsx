import React, { useEffect, useRef, useState } from "react";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = () => {
  const { settings } = useSiteSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); observer.disconnect(); } },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mapSrc = "https://maps.google.com/maps?cid=13776842535355950153&output=embed&hl=en";
  const address = settings?.address || "2nd Floor, Aditya Signature Building, Dimna Rd, Mango, Jamshedpur 831012";
  const phone = settings?.phone || "+91 79090 41132";

  return (
    <section
      ref={sectionRef}
      aria-label="Studio location"
      className="relative px-4 pb-16 md:pb-20"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Slim header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="home-kicker mb-3 mx-auto justify-center">Find Us</div>
          <h2 className="font-serif text-2xl font-normal text-white">
            Our studio in{" "}
            <span className="text-primary italic font-light">Mango, Jamshedpur</span>
          </h2>
        </div>

        {/* Map container — compact rounded card */}
        <div
          className="relative w-full overflow-hidden rounded-[24px] border border-[var(--s-border-subtle)]"
          style={{ height: "clamp(280px, 38vw, 440px)" }}
        >
          {/* Skeleton shimmer */}
          <div
            className="absolute inset-0 z-10 transition-opacity duration-700 rounded-[24px]"
            style={{ opacity: isLoaded ? 0 : 1, pointerEvents: isLoaded ? "none" : "auto" }}
            aria-hidden="true"
          >
            <div className="h-full w-full bg-[var(--s-canvas-secondary)] relative overflow-hidden rounded-[24px]">
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(209,175,110,0.04) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "mapShimmer 2.2s ease-in-out infinite",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
                    <div className="absolute inset-0 rounded-full border border-primary/25" style={{ animation: "mapPing 1.8s ease-out infinite" }} />
                    <MapPin className="h-4 w-4 text-primary/60" />
                  </div>
                  {shouldLoad && <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Loading map…</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps iframe */}
          {shouldLoad && (
            <iframe
              ref={iframeRef}
              title="Cross Angle Studio Location"
              src={mapSrc}
              className="absolute border-0"
              style={{
                top: 0,
                left: "-420px",
                width: "calc(100% + 420px)",
                height: "100%",
                opacity: isLoaded ? 1 : 0,
                transition: "opacity 0.8s ease",
                filter: "invert(92%) hue-rotate(180deg) saturate(0.8) brightness(88%) contrast(90%)",
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIsLoaded(true)}
            />
          )}

          {/* Edge masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12" style={{ background: "linear-gradient(to right, var(--s-canvas-primary, #080808) 0%, transparent 100%)" }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12" style={{ background: "linear-gradient(to left, var(--s-canvas-primary, #080808) 0%, transparent 100%)" }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12" style={{ background: "linear-gradient(to bottom, var(--s-canvas-primary, #080808) 0%, transparent 100%)" }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12" style={{ background: "linear-gradient(to top, var(--s-canvas-primary, #080808) 0%, transparent 100%)" }} />

          {/* Floating mini info card */}
          <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-start p-4 md:p-6">
            <div className="pointer-events-auto w-fit max-w-xs rounded-[16px] border border-[var(--s-border-subtle)] bg-[var(--s-canvas-secondary)]/90 px-4 py-3.5 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/10">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Studio</p>
                  <p className="text-sm font-semibold text-white leading-tight">Cross Angle Interior</p>
                </div>
              </div>
              <div className="space-y-1.5 pl-9">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white/40" />
                  <p className="text-[12px] leading-relaxed text-white/70">{address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 shrink-0 text-white/40" />
                  <p className="text-[12px] text-white/70">Mon – Sat, 9 AM – 7 PM</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 shrink-0 text-white/40" />
                  <a href={`tel:${String(phone).replace(/\s/g, "")}`} className="text-[12px] text-white/70 hover:text-primary transition-colors">{String(phone)}</a>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/place/Cross+Angle+Interior/@22.8027,86.2047,15z?cid=13776842535355950153"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[var(--s-border-subtle)] bg-white/5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 transition-all hover:bg-primary/10 hover:border-primary/25 hover:text-primary"
              >
                Open in Maps <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mapShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes mapPing {
          0% { transform: scale(1); opacity: 0.6; }
          75% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default InteractiveMap;
