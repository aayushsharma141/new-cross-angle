import { cn } from "@/lib/utils";

interface FounderFilmCardProps {
  videoUrl: string;
  className?: string;
}

/**
 * "Hear From The Founder" — the studio film, embedded, with the gold aura
 * and hover ring from the original About hero. Used as PageHero's aside
 * on desktop and rendered again below the hero on smaller screens.
 */
export const FounderFilmCard = ({ videoUrl, className }: FounderFilmCardProps) => (
  <div className={cn("relative flex flex-col gap-4 group", className)}>
    <div
      aria-hidden="true"
      className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(209,175,110,0.12),transparent_65%)] rounded-full blur-[80px] opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
    />
    <div className="flex items-center gap-3 relative z-10">
      <span aria-hidden="true" className="block w-5 h-[2px] bg-[#C9A85C] shadow-[0_0_6px_rgba(209,175,110,0.5)]" />
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">Hear From The Founder</span>
    </div>
    <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(209,175,110,0.06)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_0_1px_rgba(209,175,110,0.3)] pointer-events-none z-20"
      />
      <div className="aspect-video">
        <iframe
          src={videoUrl}
          title="Founder — CrossAngle Interior"
          className="w-full h-full border-none"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
    <p className="text-[9px] uppercase tracking-[0.22em] text-white/50 leading-relaxed relative z-10">
      How we approach turnkey interiors — from concept to final handover.
    </p>
  </div>
);

export default FounderFilmCard;
