import { motion } from "framer-motion";
import { wsMeta } from "@/addons/_shared/WorkspaceShell";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Illustrative only — real figures come from the estimator's pricing engine. */
const ROOMS = [
  { label: "Living & dining", share: 32 },
  { label: "Kitchen", share: 26 },
  { label: "Bedrooms", share: 24 },
  { label: "Bathrooms", share: 11 },
  { label: "Styling & decor", share: 7 },
];

const TIERS = [
  { label: "Essential", range: "₹15–30L" },
  { label: "Signature", range: "₹30–60L", featured: true },
  { label: "Bespoke", range: "₹60L+" },
];

/**
 * A worked example of what the estimator hands back, so the value of the tool
 * is visible before anyone starts it. Clearly labelled as a sample — the
 * numbers are illustrative, not a quote.
 */
export const SampleEstimatePreview = () => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.9, ease: EASE }}
    aria-label="Sample estimate output"
  >
    <div className="mb-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-[var(--ws-line)] pt-6">
      <span className={wsMeta}>Sample output</span>
      <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-normal tracking-[-0.02em] text-[var(--ws-ink)]">
        What you get back
      </h2>
    </div>

    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      {/* Headline range + breakdown */}
      <div className="rounded-sm border border-[var(--ws-line)] bg-[var(--ws-paper)] p-8 md:p-10">
        <p className={cn(wsMeta, "mb-3")}>3 BHK · 1,450 sq ft · Signature</p>
        <p className="mb-10 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-none text-[var(--ws-ink)]">
          ₹38.4L <span className="text-[var(--ws-faint)]">–</span> ₹46.2L
        </p>

        <p className={cn(wsMeta, "mb-5")}>Where it goes</p>
        <ul className="flex flex-col gap-4">
          {ROOMS.map((room, i) => (
            <li key={room.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2">
              <span className="text-sm font-light text-[var(--ws-ink)]/80">{room.label}</span>
              <span className="text-sm tabular-nums text-[var(--ws-faint)]">{room.share}%</span>
              <span aria-hidden="true" className="col-span-2 h-px w-full bg-[var(--ws-line)]">
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: EASE }}
                  style={{ width: `${room.share}%`, transformOrigin: "left" }}
                  className="block h-px bg-[var(--ws-bronze)]"
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Finish levels */}
      <div>
        <p className={cn(wsMeta, "mb-5")}>Compared across finish levels</p>
        <ul className="flex flex-col">
          {TIERS.map((tier) => (
            <li
              key={tier.label}
              className={cn(
                "flex items-baseline justify-between gap-6 border-t py-5",
                tier.featured ? "border-[var(--ws-bronze)]" : "border-[var(--ws-line)]",
              )}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-display text-xl text-[var(--ws-ink)]">{tier.label}</span>
                {tier.featured && (
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--ws-bronze)]">
                    Yours
                  </span>
                )}
              </span>
              <span className="text-sm tabular-nums text-[var(--ws-muted)]">{tier.range}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs font-light leading-relaxed text-[var(--ws-faint)]">
          Illustrative figures. Your estimate is generated from your own scope, city and finish choices.
        </p>
      </div>
    </div>
  </motion.section>
);

export default SampleEstimatePreview;
