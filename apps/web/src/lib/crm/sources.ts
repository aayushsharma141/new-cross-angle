/**
 * Lead source manifest.
 *
 * The single source of truth for "where did this lead come from?".
 * Every CRM surface (cards, tables, toolbars, charts) must read source
 * labels and chip styling from here — no inline `SOURCE_LABELS`.
 *
 * Naming
 * - `id`        Canonical key persisted in the DB (`lead.source` /
 *               `lead.lead_source`). Pick the most descriptive value.
 * - `label`     Human-readable name shown in dropdowns, table cells, etc.
 * - `shortCode` Compact uppercase chip text shown on Lead cards (≤5 chars).
 * - `chipClass` Tailwind class string for the card chip (bg + text + border).
 * - `aliases`   Legacy/denormalized values that should resolve to this entry.
 */

export interface CrmSource {
  id: string;
  label: string;
  shortCode: string;
  chipClass: string;
  aliases?: readonly string[];
}

export const CRM_SOURCES: readonly CrmSource[] = [
  {
    id: "website_contact",
    label: "Website",
    shortCode: "WEB",
    chipClass: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    aliases: ["contact-form", "Contact-Form", "contact_form"],
  },
  {
    id: "estimator",
    label: "Estimator",
    shortCode: "EST",
    chipClass: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
  },
  {
    id: "aesthetic_discovery_engine",
    label: "Aesthetic Discovery Engine",
    shortCode: "DISC",
    chipClass: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    aliases: ["style_quiz", "discovery_engine"],
  },
  {
    id: "welcome_popup",
    label: "Welcome Popup",
    shortCode: "POP",
    chipClass: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    shortCode: "WAPP",
    chipClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  {
    id: "instagram",
    label: "Instagram",
    shortCode: "IG",
    chipClass: "bg-pink-500/15 text-pink-300 border border-pink-500/30",
    aliases: ["meta", "facebook"],
  },
  {
    id: "referral",
    label: "Referral",
    shortCode: "REF",
    chipClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  },
  {
    id: "admin_panel",
    label: "Created by Admin",
    shortCode: "ADM",
    chipClass: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  {
    id: "other",
    label: "Other",
    shortCode: "OTHER",
    chipClass: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30",
  },
] as const;

const SOURCE_INDEX: Record<string, CrmSource> = (() => {
  const idx: Record<string, CrmSource> = {};
  for (const src of CRM_SOURCES) {
    idx[src.id] = src;
    for (const alias of src.aliases ?? []) {
      idx[alias] = src;
    }
  }
  return idx;
})();

const FALLBACK_SOURCE = CRM_SOURCES.find((src) => src.id === "other") ?? CRM_SOURCES[0];

/**
 * Resolve any DB source value (canonical or alias) to its manifest entry.
 * Returns the "Other" fallback for unknown values so the UI never blanks out.
 */
export function getCrmSource(value: string | null | undefined): CrmSource {
  if (!value) return FALLBACK_SOURCE;
  return SOURCE_INDEX[value] ?? FALLBACK_SOURCE;
}

/** Convenience: full label, falling back to "Other". */
export function getCrmSourceLabel(value: string | null | undefined): string {
  return getCrmSource(value).label;
}

/** Map of canonical id → label, kept for components that prefer object lookup. */
export const CRM_SOURCE_LABELS: Record<string, string> = CRM_SOURCES.reduce(
  (acc, src) => {
    acc[src.id] = src.label;
    for (const alias of src.aliases ?? []) acc[alias] = src.label;
    return acc;
  },
  {} as Record<string, string>,
);
