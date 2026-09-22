import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Editorial section system for the public inner pages.
 *
 * One idea per section, one image per section, generous vertical rhythm:
 * eyebrow → display heading → light body → (optional) single image/CTA.
 * Sections sit on the page canvas with no card chrome, glows or textures;
 * hierarchy comes from type scale and whitespace only.
 *
 * These are dark-surface components by design (the public site's inner pages
 * live on `--s-canvas-primary`), so they use `white` and the gold `primary`
 * token rather than theme-following foreground tokens — same reasoning as
 * the hero and footer.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.9, delay, ease: EASE_OUT_EXPO },
});

/* ── Eyebrow ─────────────────────────────────────────────────────────── */

interface EyebrowProps {
  children: React.ReactNode;
  /** Hairline on the left (default) or none. */
  rule?: boolean;
  tone?: "gold" | "muted";
  className?: string;
}

export const Eyebrow = ({ children, rule = true, tone = "gold", className }: EyebrowProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em]",
      tone === "gold" ? "text-primary" : "text-white/40",
      className,
    )}
  >
    {rule && <span aria-hidden="true" className={cn("block h-px w-8", tone === "gold" ? "bg-primary/60" : "bg-white/20")} />}
    <span>{children}</span>
  </span>
);

/* ── Display heading ─────────────────────────────────────────────────── */

type DisplaySize = "xl" | "lg" | "md" | "sm";

const displaySizes: Record<DisplaySize, string> = {
  xl: "text-[clamp(2.75rem,8vw,7rem)] leading-[0.98]",   // page hero
  lg: "text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02]", // closing statement
  md: "text-[clamp(2rem,3.6vw,3.6rem)] leading-[1.06]",  // section
  sm: "text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.1]", // sub-section / card
};

interface DisplayHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
  size?: DisplaySize;
}

export const DisplayHeading = ({ as: Tag = "h2", size = "md", className, children, ...rest }: DisplayHeadingProps) => (
  <Tag
    className={cn("font-display font-normal tracking-[-0.02em] text-white [text-wrap:balance]", displaySizes[size], className)}
    {...rest}
  >
    {children}
  </Tag>
);

/** Italic gold emphasis inside a display heading. */
export const Em = ({ children }: { children: React.ReactNode }) => (
  <span className="italic font-light text-primary">{children}</span>
);

/* ── Body ────────────────────────────────────────────────────────────── */

export const Body = ({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[15px] md:text-base font-light leading-relaxed text-white/50", className)} {...rest} />
);

/* ── Section ─────────────────────────────────────────────────────────── */

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** `py-32` breathing room by default; `tight` for strips, `loose` for closers. */
  spacing?: "default" | "tight" | "loose";
  /** Hairline above the section. */
  rule?: boolean;
  container?: boolean;
}

export const Section = ({ spacing = "default", rule = false, container = true, className, children, ...rest }: SectionProps) => (
  <section
    className={cn(
      "relative w-full",
      spacing === "default" && "py-24 md:py-32",
      spacing === "tight" && "py-16 md:py-24",
      spacing === "loose" && "py-32 md:py-40",
      rule && "border-t border-white/5",
      className,
    )}
    {...rest}
  >
    {container ? <Container>{children}</Container> : children}
  </section>
);

export const Container = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12", className)} {...rest} />
);

/* ── Split (text + one image) ────────────────────────────────────────── */

interface SplitProps {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  headingAs?: "h1" | "h2" | "h3";
  body?: React.ReactNode;
  /** Anything below the body: CTA, list, etc. */
  children?: React.ReactNode;
  media: React.ReactNode;
  /** Which side the media sits on at `lg`. */
  mediaSide?: "left" | "right";
  align?: "start" | "center";
}

export const Split = ({ eyebrow, heading, headingAs = "h2", body, children, media, mediaSide = "right", align = "center" }: SplitProps) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20",
      align === "center" ? "lg:items-center" : "lg:items-start",
    )}
  >
    <motion.div
      {...reveal()}
      className={cn(mediaSide === "left" && "lg:order-2")}
    >
      {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
      <DisplayHeading as={headingAs} size="md" className="mb-6">{heading}</DisplayHeading>
      {body && <Body className="max-w-md">{body}</Body>}
      {children && <div className="mt-10">{children}</div>}
    </motion.div>
    <motion.div
      {...reveal(0.1)}
      className={cn(mediaSide === "left" && "lg:order-1")}
    >
      {media}
    </motion.div>
  </div>
);

/* ── Numbered list (replaces card grids) ─────────────────────────────── */

export interface NumberedItem {
  title: string;
  description: string;
}

export const NumberedList = ({ items, columns = 1 }: { items: NumberedItem[]; columns?: 1 | 2 }) => (
  <ol className={cn("grid gap-x-12", columns === 2 ? "md:grid-cols-2" : "grid-cols-1")}>
    {items.map((item, i) => (
      <motion.li
        key={item.title}
        {...reveal(i * 0.05)}
        className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-7"
      >
        <span className="pt-1 text-[10px] font-bold tracking-[0.2em] text-primary">{String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3 className="font-display text-xl md:text-2xl text-white mb-2">{item.title}</h3>
          <Body className="text-sm md:text-[15px]">{item.description}</Body>
        </div>
      </motion.li>
    ))}
  </ol>
);

/* ── Stat strip ──────────────────────────────────────────────────────── */

export interface Stat {
  value: React.ReactNode;
  label: string;
}

export const StatStrip = ({ stats }: { stats: Stat[] }) => (
  <Section spacing="tight" className="border-y border-white/5">
    <dl className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-y-0">
      {stats.map((s, i) => (
        <motion.div key={s.label} {...reveal(i * 0.06)} className="flex flex-col items-center text-center">
          <dd className="font-display text-[2.75rem] md:text-[3.5rem] leading-none text-white">{s.value}</dd>
          <dt className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{s.label}</dt>
        </motion.div>
      ))}
    </dl>
  </Section>
);

/* ── Pill CTA (the footer's gold-fill button, reused) ────────────────── */

export const pillCtaClass =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-primary/30 px-7 py-3.5 md:px-8 md:py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:border-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black motion-reduce:transition-none";

export const PillCtaInner = ({ children }: { children: React.ReactNode }) => (
  <>
    <span
      aria-hidden="true"
      className="absolute inset-0 translate-y-full bg-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:transition-none"
    />
    <span className="relative z-10 flex items-center gap-3">
      {children}
      <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true">→</span>
    </span>
  </>
);

/** Quiet text link with a hairline underline. */
export const textLinkClass =
  "inline-flex items-center gap-2 border-b border-white/20 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:text-primary";

/* ── Closing statement ───────────────────────────────────────────────── */

interface ClosingProps {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}

export const Closing = ({ eyebrow, heading, body, children }: ClosingProps) => (
  <Section spacing="loose" rule>
    <motion.div {...reveal()} className="mx-auto flex max-w-4xl flex-col items-center text-center">
      {eyebrow && <Eyebrow rule={false} className="mb-8">{eyebrow}</Eyebrow>}
      <DisplayHeading size="lg" className="mb-6">{heading}</DisplayHeading>
      {body && <Body className="max-w-xl">{body}</Body>}
      {children && <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">{children}</div>}
    </motion.div>
  </Section>
);

/* ── Page hero ───────────────────────────────────────────────────────── */

interface PageHeroProps {
  eyebrow: React.ReactNode;
  heading: React.ReactNode;
  body?: React.ReactNode;
  image: { src: string; alt?: string };
  children?: React.ReactNode;
}

/**
 * 90vh photographic hero: one image, a scrim, centred display type.
 * The site header floats over it (it is transparent only on the home page,
 * so here it renders as the solid bar and the hero starts underneath).
 */
export const EditorialHero = ({ eyebrow, heading, body, image, children }: PageHeroProps) => (
  <section className="relative flex min-h-[80vh] md:min-h-[90vh] items-center justify-center overflow-hidden bg-black">
    <img
      src={image.src}
      alt={image.alt ?? ""}
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      loading="eager"
      decoding="async"
    />
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
    <Container className="relative z-10 flex flex-col items-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <Eyebrow rule={false} className="mb-8">{eyebrow}</Eyebrow>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.1, ease: EASE_OUT_EXPO }}
        className="max-w-5xl"
      >
        <DisplayHeading as="h1" size="xl">{heading}</DisplayHeading>
      </motion.div>
      {body && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="mt-8 max-w-xl"
        >
          <Body className="text-white/60">{body}</Body>
        </motion.div>
      )}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT_EXPO }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          {children}
        </motion.div>
      )}
    </Container>
  </section>
);
