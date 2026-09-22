import { cn } from "@/lib/utils";

interface ChapterKickerProps {
  children: React.ReactNode;
  /** Hairlines on both sides (centred layouts) or only the left. */
  align?: "center" | "left";
  className?: string;
}

/**
 * "Chapter 01" style eyebrow: gold uppercase micro-type between hairlines.
 * Sits above every pinned chapter on the home page so the scroll reads
 * as a sequence rather than a stack of sections.
 */
export const ChapterKicker = ({ children, align = "left", className }: ChapterKickerProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-4 lg:gap-6 uppercase text-[10px] lg:text-xs font-bold tracking-[0.4em] text-[#C9A85C]",
      className,
    )}
  >
    <span aria-hidden="true" className="block w-8 lg:w-16 h-px bg-[#C9A85C]/70" />
    <span>{children}</span>
    {align === "center" && <span aria-hidden="true" className="block w-8 lg:w-16 h-px bg-[#C9A85C]/70" />}
  </span>
);

export default ChapterKicker;
