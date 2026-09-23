import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { wsBody, wsMeta } from "./WorkspaceShell";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface EntryDoor {
  id: string;
  /** "01" / "02" — the pair reads as one system with two ways in. */
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  /** e.g. "About 3 minutes" */
  duration: string;
  /** What this door actually hands you. */
  outputs: string[];
  /** Rendered action — a Link or button styled with wsPrimaryCta / wsSecondaryCta. */
  action: React.ReactNode;
  /** Marks the recommended door. */
  featured?: boolean;
}

/**
 * The two doors into the same system, presented as a flagship pair.
 *
 * Discovery answers *what* the space should be; the estimator answers *what it
 * costs*. They share one blueprint, but either can be taken on its own — so
 * both are shown at full weight, with the recommended one marked rather than
 * the other one hidden.
 */
export const EntryChoice = ({ doors }: { doors: EntryDoor[] }) => (
  <ul className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
    {doors.map((door, i) => (
      <motion.li
        key={door.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: EASE }}
        className={cn(
          "flex flex-col border-t pt-8",
          door.featured ? "border-[var(--ws-bronze)]" : "border-[var(--ws-line)]",
        )}
      >
        <div className="mb-6 flex items-baseline gap-4">
          <span className="font-display text-xl leading-none text-[var(--ws-bronze)]">{door.index}</span>
          <span className={wsMeta}>{door.eyebrow}</span>
          {door.featured && (
            <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--ws-bronze)]">
              Recommended
            </span>
          )}
        </div>

        <h2 className="mb-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.08] tracking-[-0.02em] text-[var(--ws-ink)]">
          {door.title}
        </h2>

        <p className={cn(wsBody, "mb-8 max-w-sm")}>{door.description}</p>

        <dl className="mb-10 border-t border-[var(--ws-line)] pt-6">
          <dt className={cn(wsMeta, "mb-3")}>You receive</dt>
          <dd>
            <ul className="flex flex-col gap-2">
              {door.outputs.map((output) => (
                <li key={output} className="flex items-baseline gap-3 text-sm font-light text-[var(--ws-ink)]/80">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--ws-bronze)]/60" />
                  {output}
                </li>
              ))}
            </ul>
          </dd>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3">
          {door.action}
          <span className={wsMeta}>{door.duration}</span>
        </div>
      </motion.li>
    ))}
  </ul>
);

export default EntryChoice;
