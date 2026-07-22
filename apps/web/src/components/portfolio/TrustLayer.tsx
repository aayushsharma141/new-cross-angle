import React from "react";

export const TrustLayer = () => {
  const marqueeText = [
    "Living",
    "Gathering",
    "Working",
    "Light",
    "Materiality",
    "Detail",
    "Craft",
    "Experience",
  ];

  // Repeat items to fill space and guarantee a seamless infinite scroll
  const repeatedItems = [...marqueeText, ...marqueeText, ...marqueeText, ...marqueeText];

  return (
    <section className="relative py-8 border-y border-white/5 bg-background overflow-hidden select-none">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
      
      <div className="w-full overflow-hidden flex whitespace-nowrap relative z-10">
        <div className="animate-marquee flex gap-16 items-center pr-16 min-w-full">
          {repeatedItems.map((text, i) => (
            <React.Fragment key={i}>
              <span className="text-[11px] tracking-[0.4em] font-sans font-light text-white/20 uppercase">
                {text}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10 shrink-0" aria-hidden="true" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
