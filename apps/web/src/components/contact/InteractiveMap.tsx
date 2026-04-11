import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Clock3, MapPin, Navigation, MapPinOff } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Image } from "@/components/ui/image";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ latitude, longitude, zoom = 14 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const { settings } = useSiteSettings();

  const studioDetails = [
    {
      icon: MapPin,
      title: "Studio Presence",
      body: settings?.address || "Serving clients from Jamshedpur and Kolkata with on-site project coordination.",
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

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError(true);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    import("mapbox-gl").then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      if (mapContainer.current) {
        map = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [longitude, latitude],
          zoom,
          scrollZoom: false,
        });

        map.addControl(new mapboxgl.default.NavigationControl(), "top-right");

        const markerEl = document.createElement("div");
        markerEl.className = "custom-marker";
        markerEl.style.backgroundColor = "#d1af6e";
        markerEl.style.width = "20px";
        markerEl.style.height = "20px";
        markerEl.style.borderRadius = "50%";
        markerEl.style.boxShadow = "0 0 15px #d1af6e";

        new mapboxgl.default.Marker(markerEl).setLngLat([longitude, latitude]).addTo(map);
      }
    });

    return () => {
      if (map) map.remove();
    };
  }, [latitude, longitude, zoom]);

  return (
    <section aria-label="Office location map" className="relative z-10 overflow-hidden px-4 pb-20 md:pb-32">
      <Helmet>
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css" rel="stylesheet" />
      </Helmet>

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
                <p className="mt-5 text-sm md:text-base leading-relaxed text-white/60 max-w-md">
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
                      <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Map Area */}
            <div className="relative min-h-[480px] lg:min-h-full overflow-hidden bg-[#050505]">
              {mapError ? (
                <div className="relative flex h-full min-h-[480px] w-full flex-col items-center justify-center overflow-hidden">
                  {/* Background Fallback Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/reality_render.jpg" 
                      alt="Studio Atmosphere" 
                      className="h-full w-full"
                      imageClassName="opacity-20 grayscale brightness-50"
                      width={1200}
                      height={900}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-[#050505]/70 to-[#d1af6e]/10" />
                  </div>
                  
                  {/* Centered Message */}
                  <div className="relative z-30 flex flex-col items-center px-6 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/50 shadow-[0_0_30px_rgba(209,175,110,0.15)] backdrop-blur-md relative">
                      <div className="absolute inset-0 rounded-full border border-[#d1af6e]/30 animate-ping opacity-30" />
                      <div className="absolute inset-2 rounded-full border border-[#d1af6e]/10 animate-[ping_3s_ease-in-out_infinite] opacity-20" />
                      <MapPinOff className="h-8 w-8 text-white/50" />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-white/90 tracking-wide">Signal Interrupted</h3>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                      Our live map coordinates are currently hidden. Reach out to coordinate 
                      your visit to our strategic locations in Jamshedpur or Kolkata.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/40 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent max-lg:hidden" />
                  <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
                </>
              )}

              {/* Grid Overlay & Scanner (Location Intelligence Atmosphere) */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d1af6e]/50 to-transparent shadow-[0_0_15px_#d1af6e] absolute top-0 left-0 animate-[scan_8s_ease-in-out_infinite]" />
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
