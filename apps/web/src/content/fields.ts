/**
 * Field lists shared by several content blocks. Pure data, so both registry.ts and
 * pageBlocks.ts can import it without a circular dependency.
 */
import type { FieldDef } from "./types";

export const PAGE_SEO_FIELDS: readonly FieldDef[] = [
  { name: "title", label: "Page title", type: "text", required: true, maxLength: 70, help: "Shown in the browser tab and Google results. Aim for under 60 characters." },
  { name: "description", label: "Description", type: "textarea", required: true, maxLength: 170, help: "Shown under the title in Google. Aim for 120–160 characters." },
  { name: "ogTitle", label: "Share title", type: "text", maxLength: 90, help: "Used when the page is shared on WhatsApp, Facebook or LinkedIn." },
  { name: "ogDescription", label: "Share description", type: "textarea", maxLength: 200 },
];

export const PAGE_HEADER_FIELDS: readonly FieldDef[] = [
  { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
  { name: "headingLead", label: "Headline", type: "text", required: true, maxLength: 70 },
  { name: "headingEmphasis", label: "Headline, italic part", type: "text", maxLength: 70, help: "Shown in italics after the headline." },
  { name: "intro", label: "Introduction", type: "textarea", maxLength: 420 },
];

export const SECTION_INTRO_FIELDS: readonly FieldDef[] = [
  { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
  { name: "headingLead", label: "Heading", type: "text", required: true, maxLength: 80 },
  { name: "headingEmphasis", label: "Heading, italic part", type: "text", maxLength: 80 },
  { name: "body", label: "Text", type: "textarea", maxLength: 420 },
];

export const FAQ_ITEMS_FIELD: FieldDef = {
  name: "items",
  label: "Questions",
  type: "items",
  itemLabel: "Question",
  maxItems: 20,
  fields: [
    { name: "question", label: "Question", type: "text", required: true, maxLength: 160 },
    { name: "answer", label: "Answer", type: "textarea", required: true, maxLength: 700 },
  ],
};

export const TITLED_POINTS_FIELD: FieldDef = {
  name: "items",
  label: "Points",
  type: "items",
  itemLabel: "Point",
  maxItems: 8,
  help: "Shown as a numbered list, in this order.",
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 60 },
    { name: "description", label: "Description", type: "textarea", required: true, maxLength: 260 },
  ],
};
