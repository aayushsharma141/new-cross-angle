/**
 * Editable site content — the single list of blocks a super admin can change
 * from /admin/cms/site-content without touching code.
 *
 * Each block has:
 *   - a key (stored in `site_content.key`),
 *   - a field schema (drives the admin form AND validates what is read back),
 *   - defaults — the text that shipped in code. The public site always renders
 *     *something*: published value → default. A missing row, a failed request or
 *     a malformed value all fall back to the default, never to a blank section.
 *
 * To make another part of the site editable: add its shape to `ContentMap`,
 * add a block below, then read it with `useSiteContent("your.key")`.
 */

import { PRIVACY_DEFAULTS, TERMS_DEFAULTS } from "./defaults/legal";
import { SERVICE_BANDS } from "@/config/service-area";
import { PAGE_SEO_FIELDS } from "./fields";
import { PAGE_BLOCKS } from "./pageBlocks";
import type { ContentBlockDef, ContentKey, ContentMap, FieldDef } from "./types";
export * from "./types";

function block<K extends ContentKey>(def: ContentBlockDef<K>): ContentBlockDef<K> {
  return def;
}

const MARKDOWN_HELP = "Formatting: **bold**, *italic*, “- ” for bullet points, “### ” for a sub-heading, “> ” for a highlighted box, [link text](/page).";

const LEGAL_FIELDS: readonly FieldDef[] = [
  { name: "seoTitle", label: "Page title (Google)", type: "text", required: true, maxLength: 70 },
  { name: "seoDescription", label: "Description (Google)", type: "textarea", required: true, maxLength: 170 },
  { name: "ogTitle", label: "Share title", type: "text", maxLength: 90 },
  { name: "ogDescription", label: "Share description", type: "textarea", maxLength: 200 },
  { name: "badge", label: "Badge above the title", type: "text", maxLength: 50 },
  { name: "titleLead", label: "Title", type: "text", required: true, maxLength: 60 },
  { name: "titleEmphasis", label: "Title, highlighted part", type: "text", maxLength: 60 },
  { name: "intro", label: "Introduction", type: "markdown", required: true, maxLength: 600, help: MARKDOWN_HELP },
  { name: "metaItems", label: "Dates and details line", type: "list", itemLabel: "Detail", maxItems: 4, help: "For example “Last Updated: 1 June 2026”. Update the date whenever the text changes." },
  {
    name: "sections",
    label: "Sections",
    type: "items",
    itemLabel: "Section",
    maxItems: 30,
    help: "Sections are numbered automatically, in this order.",
    fields: [
      { name: "title", label: "Section title", type: "text", required: true, maxLength: 120 },
      { name: "body", label: "Text", type: "markdown", required: true, maxLength: 8000, help: MARKDOWN_HELP },
    ],
  },
  { name: "footerNote", label: "Note at the bottom", type: "markdown", maxLength: 400, help: MARKDOWN_HELP },
];

/* ─── Blocks ─────────────────────────────────────────────────────────────── */

export const CONTENT_BLOCKS: readonly ContentBlockDef[] = [
  block({
    key: "home.seo",
    group: "Home page",
    label: "Search & sharing",
    description: "What Google and social apps show for the home page.",
    previewPath: "/",
    fields: [
      { name: "title", label: "Page title", type: "text", required: true, maxLength: 70, help: "Shown in the browser tab and Google results. Aim for under 60 characters." },
      { name: "description", label: "Description", type: "textarea", required: true, maxLength: 170, help: "Shown under the title in Google. Aim for 120–160 characters." },
      { name: "keywords", label: "Keywords", type: "text", help: "Comma separated. Optional — most search engines ignore these." },
      { name: "ogTitle", label: "Share title", type: "text", maxLength: 90, help: "Used when the page is shared on WhatsApp, Facebook or LinkedIn." },
      { name: "ogDescription", label: "Share description", type: "textarea", maxLength: 200 },
    ],
    defaults: {
      title: "Crossangle Interior | Premium Interior Design Studio",
      description:
        "Transform your vision into exquisite living spaces with Crossangle Interior. Innovative and personalized interior design solutions for homes and commercial spaces in Jamshedpur.",
      keywords:
        "interior design, residential design, commercial design, luxury interiors, home design, space planning, Jamshedpur, modular kitchen, false ceiling",
      ogTitle: "Crossangle Interior | Premium Interior Design Studio in Jamshedpur",
      ogDescription:
        "Transform your vision into exquisite living spaces with Crossangle Interior. Innovative and personalized interior design solutions.",
    },
  }),

  block({
    key: "home.philosophy",
    group: "Home page",
    label: "Philosophy chapter",
    description: "The full-screen opening statement that animates as visitors scroll.",
    previewPath: "/",
    fields: [
      { name: "chapterLabel", label: "Chapter label", type: "text", maxLength: 30 },
      { name: "titleLine1", label: "Title, first line", type: "text", required: true, maxLength: 40 },
      { name: "titleLine2", label: "Title, second line", type: "text", required: true, maxLength: 40 },
      { name: "scrollHint", label: "Scroll hint", type: "text", maxLength: 40 },
      { name: "eyebrow", label: "Statement label", type: "text", maxLength: 40 },
      { name: "statementLine1", label: "Statement, first sentence", type: "textarea", required: true, maxLength: 140 },
      { name: "statementLine2", label: "Statement, second sentence", type: "textarea", required: true, maxLength: 140 },
      { name: "outroLeft", label: "Closing line, left", type: "text", maxLength: 60 },
      { name: "outroRight", label: "Closing line, right", type: "text", maxLength: 80 },
    ],
    defaults: {
      chapterLabel: "Chapter 01",
      titleLine1: "Homes Designed",
      titleLine2: "For Living.",
      scrollHint: "Scroll to explore",
      eyebrow: "The Philosophy",
      statementLine1: "We treat interior design as an engineering problem, not decoration.",
      statementLine2: "Every line has a purpose. Every material is chosen to last.",
      outroLeft: "Engineered for predictability",
      outroRight: "The CrossAngle Predictable Interior System™",
    },
  }),

  block({
    key: "home.tools",
    group: "Home page",
    label: "Style quiz & estimator",
    description: "The two-tool section that sends visitors to the style quiz and the cost estimator.",
    previewPath: "/",
    fields: [
      { name: "eyebrow", label: "Section label", type: "text", maxLength: 40 },
      { name: "headingLead", label: "Heading", type: "text", required: true, maxLength: 60 },
      { name: "headingEmphasis", label: "Heading, emphasised part", type: "text", maxLength: 60, help: "Shown in italics after the heading." },
      { name: "intro", label: "Introduction", type: "textarea", maxLength: 320 },
      {
        name: "items",
        label: "Tools",
        type: "items",
        itemLabel: "Tool",
        maxItems: 4,
        help: "The first tool is highlighted as “Start here”.",
        fields: [
          { name: "index", label: "Number", type: "text", maxLength: 3 },
          { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
          { name: "titleLead", label: "Title", type: "text", required: true, maxLength: 60 },
          { name: "titleEmphasis", label: "Title, emphasised part", type: "text", maxLength: 60 },
          { name: "description", label: "Description", type: "textarea", maxLength: 260 },
          { name: "duration", label: "How long it takes", type: "text", maxLength: 40 },
          { name: "outputs", label: "What the visitor receives", type: "list", itemLabel: "Item", maxItems: 6 },
          { name: "ctaLabel", label: "Button text", type: "text", required: true, maxLength: 40 },
          { name: "href", label: "Button link", type: "url", required: true, help: "A site path such as /estimate, or a full https:// address." },
        ],
      },
    ],
    defaults: {
      eyebrow: "Start before you commit",
      headingLead: "Two ways in.",
      headingEmphasis: "One system.",
      intro:
        "Most studios make you book a meeting to learn anything. Ours gives you a design direction and a costed range first — free, in minutes, with no obligation. Take either on its own, or let one feed the other.",
      items: [
        {
          index: "01",
          eyebrow: "Style discovery",
          titleLead: "Find your design",
          titleEmphasis: "identity.",
          description:
            "A guided read of instinct, emotion and texture that produces your interior archetype — the blueprint everything else is built from.",
          duration: "About 6 minutes",
          outputs: ["Your archetype, named", "Colour & material direction", "A practical design roadmap"],
          ctaLabel: "Take the style quiz",
          href: "/aesthetic-discovery-engine",
        },
        {
          index: "02",
          eyebrow: "Cost estimator",
          titleLead: "Know what it",
          titleEmphasis: "actually costs.",
          description:
            "A costed range before the first meeting, built from real project data — and sharper still once it knows your taste.",
          duration: "About 3 minutes",
          outputs: ["Investment range for your scope", "Room-by-room breakdown", "Finish level comparison"],
          ctaLabel: "Get an estimate",
          href: "/estimate",
        },
      ],
    },
  }),

  block({
    key: "home.featured",
    group: "Home page",
    label: "Featured project",
    description: "The large photograph-and-caption block between Services and Process.",
    previewPath: "/",
    fields: [
      { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
      { name: "title", label: "Project name", type: "text", required: true, maxLength: 60 },
      { name: "chips", label: "Tags", type: "list", itemLabel: "Tag", maxItems: 4, help: "For example the city and the type of project." },
      { name: "description", label: "Short description", type: "textarea", maxLength: 200 },
      { name: "linkLabel", label: "Link text", type: "text", maxLength: 40 },
      { name: "linkHref", label: "Link address", type: "url", help: "Usually a portfolio page, such as /portfolio/your-project." },
      { name: "imageUrl", label: "Photograph", type: "url", required: true, help: "Paste an image address from the Media library." },
      { name: "imageAlt", label: "Photograph description", type: "text", required: true, maxLength: 160, help: "Read aloud by screen readers and used by Google Images." },
    ],
    defaults: {
      eyebrow: "01 / Featured Project",
      title: "The Highland Residence",
      chips: ["Jamshedpur", "Turn-key"],
      description: "Limestone / Oak / Natural Light. An exercise in material restraint and spatial flow.",
      linkLabel: "View Case Study",
      linkHref: "/portfolio",
      imageUrl: "/hero_reality_render_1775299733746.png",
      imageAlt: "The Highland Residence architectural interior — Jamshedpur luxury residential project",
    },
  }),

  block({
    key: "home.faq",
    group: "Home page",
    label: "Questions & answers",
    description: "The FAQ on the home page. The same text is sent to Google as FAQ rich results.",
    previewPath: "/",
    fields: [
      { name: "eyebrow", label: "Section label", type: "text", maxLength: 40 },
      { name: "headingLead", label: "Heading", type: "text", required: true, maxLength: 40 },
      { name: "headingEmphasis", label: "Heading, emphasised part", type: "text", maxLength: 40 },
      {
        name: "items",
        label: "Questions",
        type: "items",
        itemLabel: "Question",
        maxItems: 12,
        fields: [
          { name: "question", label: "Question", type: "text", required: true, maxLength: 160 },
          { name: "answer", label: "Answer", type: "textarea", required: true, maxLength: 600 },
        ],
      },
    ],
    defaults: {
      eyebrow: "Common Questions",
      headingLead: "Answers",
      headingEmphasis: "For You",
      items: [
        {
          question: "What interior design services does Cross Angle Interior provide in Jamshedpur?",
          answer:
            "We offer comprehensive, turn-key interior design services for luxury residential homes, apartments, custom modular kitchens, premium false ceilings, and bespoke commercial spaces/offices across Jamshedpur and surrounding regions.",
        },
        {
          question: "How long does a typical home interior project take?",
          answer:
            "Most premium residential projects take between 45 to 75 days from concept design approval to material execution and final handover. Timeline details are provided transparently during our 3D visualization phase.",
        },
        {
          question: "Do you offer custom modular kitchens and modern finishes?",
          answer:
            "Yes, we specialize in high-end modular kitchens with soft-close mechanisms, custom acrylic or PU finishes, premium quartz countertops, and sleek space-saving accessories designed to last a lifetime.",
        },
        {
          question: "What is the process of getting an interior design estimate?",
          answer:
            "You can use our interactive digital cost estimator page online or contact us directly. We provide a detailed spatial planning consult, followed by exact line-item material estimations and 3D design iterations.",
        },
      ],
    },
  }),

  block({
    key: "home.gallery_cta",
    group: "Home page",
    label: "Gallery invitation",
    description: "The closing call-to-action at the bottom of the home page.",
    previewPath: "/",
    fields: [
      { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
      { name: "heading", label: "Heading", type: "text", required: true, maxLength: 60 },
      { name: "linkLabel", label: "Link text", type: "text", required: true, maxLength: 40 },
      { name: "linkHref", label: "Link address", type: "url", required: true },
    ],
    defaults: {
      eyebrow: "The Archive",
      heading: "Explore the Gallery",
      linkLabel: "Enter Gallery",
      linkHref: "/gallery",
    },
  }),
  /* ─── Our Process ─────────────────────────────────────────────────────── */
  block({
    key: "process.seo",
    group: "Our Process page",
    label: "Search & sharing",
    description: "What Google and social apps show for the Our Process page.",
    previewPath: "/our-process",
    fields: PAGE_SEO_FIELDS,
    defaults: {
      title: "Our Process | Cross Angle Interior",
      description:
        "A contractually-guaranteed 5-stage turnkey interior design process. From consultation to handover — see timelines, budgets, and what you can expect at every stage.",
      ogTitle: "Our Process | Cross Angle Interior",
      ogDescription:
        "A contractually-guaranteed 5-stage turnkey interior design process. From consultation to handover — see timelines, budgets, and what you can expect at every stage.",
    },
  }),
  block({
    key: "process.hero",
    group: "Our Process page",
    label: "Opening section",
    description: "The headline and buttons at the top of the page. The five stages, studio numbers and questions below it come from Process Steps.",
    previewPath: "/our-process",
    fields: [
      { name: "kicker", label: "Label", type: "text", maxLength: 40 },
      { name: "lineLead", label: "Headline, first part", type: "text", required: true, maxLength: 60 },
      { name: "lineEmphasis", label: "Headline, second part (italic)", type: "text", maxLength: 60 },
      { name: "lede", label: "Introduction", type: "textarea", maxLength: 320 },
      { name: "primaryLabel", label: "Main link text", type: "text", maxLength: 40, help: "Links to the contact page." },
      { name: "anchorLabel", label: "Scroll link text", type: "text", maxLength: 40, help: "Scrolls down to the stages." },
    ],
    defaults: {
      kicker: "How we work",
      lineLead: "From your first idea",
      lineEmphasis: "to your finished space",
      lede: "A contractually-guaranteed 5-stage system that eliminates guesswork, protects your budget, and delivers on time. No ambiguity from the first brief to the final handover.",
      primaryLabel: "Book a free consultation",
      anchorLabel: "Explore the 5 stages",
    },
  }),
  block({
    key: "process.faq_intro",
    group: "Our Process page",
    label: "Questions heading",
    description: "The heading beside the questions list. The questions themselves are managed in the database table process_faqs.",
    previewPath: "/our-process",
    fields: [
      { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
      { name: "headingLead", label: "Heading", type: "text", required: true, maxLength: 60 },
      { name: "headingEmphasis", label: "Heading, emphasised part", type: "text", maxLength: 60 },
      { name: "intro", label: "Introduction", type: "textarea", maxLength: 260 },
    ],
    defaults: {
      eyebrow: "Questions",
      headingLead: "How the process",
      headingEmphasis: "actually runs.",
      intro:
        "What clients ask before signing — how changes are handled, what happens if a stage slips, and who is accountable for what.",
    },
  }),

  /* ─── Locations ───────────────────────────────────────────────────────── */
  block({
    key: "locations.seo",
    group: "Locations page",
    label: "Search & sharing",
    description: "What Google and social apps show for the Service Areas page.",
    previewPath: "/locations",
    fields: [
      { name: "title", label: "Page title", type: "text", required: true, maxLength: 70 },
      { name: "description", label: "Description", type: "textarea", required: true, maxLength: 170, help: "Type {areas} where the number of areas should appear; it is filled in automatically." },
      { name: "ogTitle", label: "Share title", type: "text", maxLength: 90 },
      { name: "ogDescription", label: "Share description", type: "textarea", maxLength: 200, help: "{areas} works here too." },
    ],
    defaults: {
      title: "Service Areas | Interior Designers in Jamshedpur & Eastern India",
      description:
        "Turn-key interior design across {areas} areas — every Jamshedpur neighbourhood plus Ranchi, Dhanbad, Bokaro, Kolkata, Bhubaneswar and Patna. See how we work in each.",
      ogTitle: "Service Areas | Cross Angle Interior",
      ogDescription: "Turn-key interior design across {areas} areas in eastern India, based in Jamshedpur.",
    },
  }),
  block({
    key: "locations.hero",
    group: "Locations page",
    label: "Opening section",
    description: "The headline, introduction and buttons at the top of the page.",
    previewPath: "/locations",
    fields: [
      { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
      { name: "headingLead", label: "Headline, first part", type: "text", required: true, maxLength: 70 },
      { name: "headingEmphasis", label: "Headline, second part (italic)", type: "text", maxLength: 70 },
      { name: "intro", label: "Introduction", type: "textarea", maxLength: 420 },
      { name: "primaryLabel", label: "Main button text", type: "text", maxLength: 40, help: "Links to the estimator." },
      { name: "secondaryLabel", label: "Second link text", type: "text", maxLength: 40, help: "Links to the contact page." },
    ],
    defaults: {
      eyebrow: "Where we work",
      headingLead: "Based in Jamshedpur.",
      headingEmphasis: "Delivering across the east.",
      intro:
        "We keep a resident team rather than a franchise network, so the studio works where it can supervise properly. Every area below is one we actually deliver in — and each one asks for something slightly different.",
      primaryLabel: "Get an estimate",
      secondaryLabel: "Talk to the studio",
    },
  }),
  block({
    key: "locations.stats",
    group: "Locations page",
    label: "Numbers strip",
    description: "The four figures under the headline. “Areas served” is counted automatically from the list of areas.",
    previewPath: "/locations",
    fields: [
      { name: "homeCity", label: "Home city", type: "text", required: true, maxLength: 30 },
      { name: "states", label: "Number of states", type: "text", required: true, maxLength: 10, help: "Type the number you can stand behind." },
      { name: "projectsDelivered", label: "Projects delivered", type: "text", required: true, maxLength: 12, help: "Shown exactly as typed, e.g. 1,200+. Keep it accurate — visitors rely on it." },
    ],
    defaults: { homeCity: "Jamshedpur", states: "4", projectsDelivered: "1,200+" },
  }),
  block({
    key: "locations.areas",
    group: "Locations page",
    label: "Areas we serve",
    description: "The groups of areas and the paragraph shown for each one. The footer's Jamshedpur list uses the first group with the id “jamshedpur”.",
    previewPath: "/locations",
    fields: [
      {
        name: "bands",
        label: "Groups",
        type: "items",
        itemLabel: "Group",
        maxItems: 8,
        help: "Groups are ordered by distance from the studio.",
        fields: [
          { name: "id", label: "Group id", type: "text", required: true, maxLength: 30, help: "Lowercase letters, numbers and dashes. Used internally; avoid changing it later." },
          { name: "label", label: "Group name", type: "text", required: true, maxLength: 50 },
          { name: "note", label: "What delivery looks like here", type: "textarea", maxLength: 240 },
          {
            name: "areas",
            label: "Areas",
            type: "items",
            itemLabel: "Area",
            maxItems: 40,
            fields: [
              { name: "slug", label: "Link name", type: "text", required: true, maxLength: 40, help: "Lowercase letters, numbers and dashes, e.g. bistupur. Becomes /locations#bistupur." },
              { name: "name", label: "Area name", type: "text", required: true, maxLength: 50 },
              { name: "context", label: "Beside the name", type: "text", maxLength: 50, help: "A district or state, e.g. Central Jamshedpur." },
              { name: "focus", label: "Work we do most here", type: "text", maxLength: 120 },
              { name: "copy", label: "What working here is like", type: "textarea", maxLength: 700 },
            ],
          },
        ],
      },
    ],
    defaults: {
      bands: SERVICE_BANDS.map((band) => ({
        id: band.id,
        label: band.label,
        note: band.note,
        areas: band.areas.map(({ slug, name, context, focus, copy }) => ({ slug, name, context, focus, copy })),
      })),
    },
    validate: ({ bands }) => {
      const problems: string[] = [];
      const slugOk = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      const seenBands = new Set<string>();
      const seenSlugs = new Set<string>();
      if (bands.length === 0) problems.push("Add at least one group");
      bands.forEach((band, bi) => {
        const where = `Group ${bi + 1}`;
        if (band.id && !slugOk.test(band.id)) problems.push(`${where} › Group id may only use lowercase letters, numbers and dashes`);
        if (seenBands.has(band.id)) problems.push(`${where} › Group id “${band.id}” is used twice`);
        seenBands.add(band.id);
        band.areas.forEach((area, ai) => {
          const at = `${where} › Area ${ai + 1}`;
          if (area.slug && !slugOk.test(area.slug)) problems.push(`${at} › Link name may only use lowercase letters, numbers and dashes`);
          if (seenSlugs.has(area.slug)) problems.push(`${at} › Link name “${area.slug}” is used twice`);
          seenSlugs.add(area.slug);
        });
      });
      return problems;
    },
  }),
  block({
    key: "locations.closing",
    group: "Locations page",
    label: "Closing section",
    description: "The “project outside this map?” block at the bottom.",
    previewPath: "/locations",
    fields: [
      { name: "eyebrow", label: "Label", type: "text", maxLength: 40 },
      { name: "headingLead", label: "Heading", type: "text", required: true, maxLength: 60 },
      { name: "headingEmphasis", label: "Heading, emphasised part", type: "text", maxLength: 60 },
      { name: "body", label: "Text", type: "textarea", maxLength: 420 },
      { name: "primaryLabel", label: "Main button text", type: "text", maxLength: 40, help: "Links to the contact page." },
      { name: "secondaryLabel", label: "Second link text", type: "text", maxLength: 40, help: "Links to the estimator." },
    ],
    defaults: {
      eyebrow: "Further afield",
      headingLead: "Project outside",
      headingEmphasis: "this map?",
      body: "We take selected projects beyond the region when the scope justifies the travel — outstation work runs with scheduled site visits and weekly video walk-throughs. Tell us where it is.",
      primaryLabel: "Ask about your city",
      secondaryLabel: "Get a free estimate",
    },
  }),

  /* ─── Legal ───────────────────────────────────────────────────────────── */
  block({
    key: "legal.privacy",
    group: "Legal pages",
    label: "Privacy Policy",
    description: "The full policy. Every published change is kept in History, so there is a record of what it said and when.",
    previewPath: "/privacy",
    fields: LEGAL_FIELDS,
    defaults: PRIVACY_DEFAULTS,
  }),
  block({
    key: "legal.terms",
    group: "Legal pages",
    label: "Terms & Conditions",
    description: "The full terms. Every published change is kept in History, so there is a record of what it said and when.",
    previewPath: "/terms",
    fields: LEGAL_FIELDS,
    defaults: TERMS_DEFAULTS,
  }),

  ...PAGE_BLOCKS,
] as const;

export function getBlockDef<K extends ContentKey>(key: K): ContentBlockDef<K> {
  const def = CONTENT_BLOCKS.find((b) => b.key === key);
  if (!def) throw new Error(`Unknown content block: ${key}`);
  return def as ContentBlockDef<K>;
}

/* ─── Normalisation ──────────────────────────────────────────────────────── */

type Json = Record<string, unknown>;
const isRecord = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

function normalizeField(field: FieldDef, raw: unknown, fallback: unknown): unknown {
  switch (field.type) {
    case "text":
    case "textarea":
    case "url":
    case "markdown":
      return typeof raw === "string" ? raw : (fallback ?? "");
    case "boolean":
      return typeof raw === "boolean" ? raw : (typeof fallback === "boolean" ? fallback : false);
    case "list": {
      if (!Array.isArray(raw)) return Array.isArray(fallback) ? fallback : [];
      return raw.filter((v): v is string => typeof v === "string");
    }
    case "items": {
      if (!Array.isArray(raw)) return Array.isArray(fallback) ? fallback : [];
      return raw.filter(isRecord).map((item) => normalizeFields(field.fields, item, {}));
    }
  }
}

function normalizeFields(fields: readonly FieldDef[], raw: unknown, fallback: Json): Json {
  const src = isRecord(raw) ? raw : {};
  const out: Json = {};
  for (const f of fields) out[f.name] = normalizeField(f, src[f.name], fallback[f.name]);
  return out;
}

/**
 * Shape any stored value into the block's type. Unknown keys are dropped; wrong-typed
 * or missing fields take the default, so a hand-edited or stale row can't crash a page.
 */
export function normalizeBlock<K extends ContentKey>(def: ContentBlockDef<K>, raw: unknown): ContentMap[K] {
  return normalizeFields(def.fields, raw, def.defaults as unknown as Json) as unknown as ContentMap[K];
}

/** Blank value for a new list entry, matching the field schema. */
export function emptyItem(fields: readonly FieldDef[]): Json {
  const out: Json = {};
  for (const f of fields) out[f.name] = f.type === "list" || f.type === "items" ? [] : f.type === "boolean" ? false : "";
  return out;
}

/** Site path, or an http(s)/mailto/tel address. Anything else (e.g. `javascript:`) is rejected. */
export function isSafeAddress(value: string): boolean {
  const v = value.trim();
  return (v.startsWith("/") && !v.startsWith("//")) || /^(https?:|mailto:|tel:)/i.test(v);
}

/** Messages for required fields that are empty, for the publish check. */
export function validateBlock(def: ContentBlockDef, value: unknown): string[] {
  const problems: string[] = [];
  const walk = (fields: readonly FieldDef[], v: unknown, path: string) => {
    const src = isRecord(v) ? v : {};
    for (const f of fields) {
      const val = src[f.name];
      const here = path ? `${path} › ${f.label}` : f.label;
      if (f.type === "items") {
        const arr = Array.isArray(val) ? val : [];
        arr.forEach((item, i) => walk(f.fields, item, `${f.itemLabel} ${i + 1}`));
      } else if (f.type !== "list" && f.type !== "boolean" && f.required && (typeof val !== "string" || val.trim() === "")) {
        problems.push(`${here} is required`);
      } else if (f.type === "url" && typeof val === "string" && val.trim() !== "" && !isSafeAddress(val)) {
        problems.push(`${here} must start with / or https://`);
      }
    }
  };
  walk(def.fields, value, "");
  if (problems.length === 0 && def.validate) {
    problems.push(...(def.validate as (v: unknown) => string[])(normalizeBlock(def, value)));
  }
  return problems;
}
