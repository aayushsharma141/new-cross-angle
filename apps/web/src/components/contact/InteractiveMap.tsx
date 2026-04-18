import React from "react";
import { Clock3, MapPin, Navigation } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import useReducedMotion from "@/hooks/useReducedMotion";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ latitude, longitude, zoom = 14 }) => {
  const { settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();

  const studioDetails = [
    {
      icon: MapPin,
      title: "Studio Presence",
      body: settings?.address || "Serving clients across Jamshedpur and nearby neighborhoods with on-site project coordination.",
    },
    {
      icon: Clock3,
      title: "Working Rhythm",
      body: "Monday to Saturday, 9AM to 7PM for calls, visits, and project reviews.",
    },
    {
      icon: Navigation,
      title: "Visits By Discussion",
      body: "Reach out before dropping by so we can reserve time for your consultation.",
    },
  ];

  // Google Maps embed URL — no API key required
  const mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed&t=k`;

  return (
    <section aria-label="Office location map" className="relative z-10 overflow-hidden px-4 pb-20 md:pb-32">
      <div className="container mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">

            {/* Left Content Context */}
            <div className="relative flex flex-col justify-center border-b border-white/[0.05] p-8 md:p-12 lg:border-b-0 lg:border-r">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#d1af6e]/5 blur-[120px] rounded-full pointer-events-none" />

              <div className="relative z-10 mb-8">
                <div className="home-kicker mb-5 inline-flex bg-white/5 border border-white/5 px-3 py-1">Studio Presence</div>
                <h2 className="font-serif text-3xl font-semibold text-white md:text-5xl leading-[1.1]">
                  Find us where projects <span className="text-[#d1af6e] italic">take shape.</span>
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
                  Our location section is here to reassure you that there is a real
                  team, a real base, and a real process behind every inquiry.
                </p>
              </div>

              <div className="mt-4 space-y-4 relative z-10">
                {studioDetails.map((item) => (
                  <div key={item.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-[20px] border border-white/5 bg-[#111111]/50 p-5 transition-colors hover:bg-[#151515]">
                    <div className="flex shrink-0 h-14 w-14 items-center justify-center rounded-[14px] border border-[#d1af6e]/20 bg-[#d1af6e]/10 shadow-[0_0_20px_rgba(209,175,110,0.05)]">
                      <item.icon className="h-6 w-6 text-[#d1af6e]" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Map Area */}
            <div className="relative min-h-[480px] lg:min-h-full overflow-hidden bg-[#050505] opacity-100">
              {/* Gradient overlays for blending */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/40 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent max-lg:hidden" />

              {/* Google Maps iframe */}
              <iframe
                title="Cross Angle Studio Location"
                src={mapSrc}
                className="absolute inset-0 h-full w-full border-0 opacity-100 pointer-events-auto"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
              />

              {/* Grid Overlay & Scanner (Location Intelligence Atmosphere) */}
              <div className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                {!prefersReducedMotion && (
                  <div className="absolute top-0 left-0 h-[2px] w-full animate-[scan_8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#d1af6e]/50 to-transparent shadow-[0_0_15px_#d1af6e]" />
                )}
                <style>{`
                  @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                  }
                `}</style>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
