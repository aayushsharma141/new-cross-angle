import { cn } from "@/lib/utils";

interface FounderFilmCardProps {
  videoUrl: string;
  className?: string;
}

/**
 * The studio film — a plain 16:9 embed with a hairline caption underneath.
 * Used as the single image of the About page's "studio" section.
 */
export const FounderFilmCard = ({ videoUrl, className }: FounderFilmCardProps) => (
  <figure className={cn("w-full", className)}>
    <div className="aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={videoUrl}
        title="Founder — CrossAngle Interior"
        className="h-full w-full border-none"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
    <figcaption className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
      <span aria-hidden="true" className="block h-px w-8 bg-white/20" />
      Hear from the founder
    </figcaption>
  </figure>
);

export default FounderFilmCard;
