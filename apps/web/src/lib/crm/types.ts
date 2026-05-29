/**
 * Lead type / project category manifest.
 *
 * Mirrors the values stored on `lead.category` or `lead.lead_type`.
 * Provides a stable list for filters and a label resolver for tables/cards.
 */

export interface CrmLeadType {
  id: string;
  label: string;
  /** Short helper text used in tooltips or empty-state hints. */
  description?: string;
}

export const CRM_LEAD_TYPES: readonly CrmLeadType[] = [
  { id: "interior", label: "Interior", description: "Full home or villa interior project" },
  { id: "renovation", label: "Renovation", description: "Renovating an existing space" },
  { id: "consultation", label: "Consultation", description: "Advisory or single-room scope" },
  { id: "commercial", label: "Commercial", description: "Office, retail, or hospitality fit-out" },
] as const;

export const CRM_LEAD_TYPE_LABELS: Record<string, string> = CRM_LEAD_TYPES.reduce(
  (acc, t) => {
    acc[t.id] = t.label;
    return acc;
  },
  {} as Record<string, string>,
);

/** Resolve a lead's category/type to a label, falling back to the raw value or em-dash. */
export function getCrmLeadTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return CRM_LEAD_TYPE_LABELS[value] ?? value;
}
