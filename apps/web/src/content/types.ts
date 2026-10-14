/**
 * Types for editable site content. Kept in one dependency-free file so registry.ts,
 * fields.ts and pageBlocks.ts can all import it without forming an import cycle.
 */
import type { LegalDocument } from "./defaults/legal";

export type TextField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "markdown";
  help?: string;
  maxLength?: number;
  /** Empty value is rejected at publish time. */
  required?: boolean;
};
export type ListField = { name: string; label: string; type: "list"; itemLabel: string; help?: string; maxItems?: number };
export type ItemsField = {
  name: string;
  label: string;
  type: "items";
  itemLabel: string;
  fields: readonly FieldDef[];
  help?: string;
  maxItems?: number;
};
export type BooleanField = { name: string; label: string; type: "boolean"; help?: string };
export type FieldDef = TextField | ListField | ItemsField | BooleanField;

/** Narrowing helper: a TextField's `type` is itself a union, so `field.type === ...` alone does not exclude it. */
export const isTextField = (f: FieldDef): f is TextField => f.type === "text" || f.type === "textarea" || f.type === "url" || f.type === "markdown";

/* ─── Content shapes ─────────────────────────────────────────────────────── */

export interface HomeSeo {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export interface HomePhilosophy {
  chapterLabel: string;
  titleLine1: string;
  titleLine2: string;
  scrollHint: string;
  eyebrow: string;
  statementLine1: string;
  statementLine2: string;
  outroLeft: string;
  outroRight: string;
}

export interface HomeToolItem {
  index: string;
  eyebrow: string;
  titleLead: string;
  titleEmphasis: string;
  description: string;
  duration: string;
  outputs: string[];
  ctaLabel: string;
  href: string;
}
export interface HomeTools {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  intro: string;
  items: HomeToolItem[];
}

export interface HomeFeatured {
  eyebrow: string;
  title: string;
  chips: string[];
  description: string;
  linkLabel: string;
  linkHref: string;
  imageUrl: string;
  imageAlt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface HomeFaq {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  items: FaqItem[];
}

export interface HomeGalleryCta {
  eyebrow: string;
  heading: string;
  linkLabel: string;
  linkHref: string;
}

export type { LegalDocument };

export interface PageSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

export interface ProcessHero {
  kicker: string;
  lineLead: string;
  lineEmphasis: string;
  lede: string;
  primaryLabel: string;
  anchorLabel: string;
}
export interface ProcessFaqIntro {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  intro: string;
}

export interface LocationsHero {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  intro: string;
  primaryLabel: string;
  secondaryLabel: string;
}
export interface LocationsStats {
  homeCity: string;
  states: string;
  projectsDelivered: string;
}
export interface LocationsClosing {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
}
export interface ServiceAreaItem {
  slug: string;
  name: string;
  context: string;
  focus: string;
  copy: string;
}
export interface ServiceBandItem {
  id: string;
  label: string;
  note: string;
  areas: ServiceAreaItem[];
}
export interface LocationsAreas {
  bands: ServiceBandItem[];
}

export interface ContentMap extends PageContentMap {
  "home.seo": HomeSeo;
  "home.philosophy": HomePhilosophy;
  "home.tools": HomeTools;
  "home.featured": HomeFeatured;
  "home.faq": HomeFaq;
  "home.gallery_cta": HomeGalleryCta;
  "process.seo": PageSeo;
  "process.hero": ProcessHero;
  "process.faq_intro": ProcessFaqIntro;
  "locations.seo": PageSeo;
  "locations.hero": LocationsHero;
  "locations.stats": LocationsStats;
  "locations.areas": LocationsAreas;
  "locations.closing": LocationsClosing;
  "legal.privacy": LegalDocument;
  "legal.terms": LegalDocument;
}
export type ContentKey = keyof ContentMap;

export interface ContentBlockDef<K extends ContentKey = ContentKey> {
  key: K;
  group: string;
  label: string;
  description: string;
  /** Public path where the change can be seen. */
  previewPath: string;
  fields: readonly FieldDef[];
  defaults: ContentMap[K];
  /** Extra rules that span fields (e.g. unique slugs). Return plain-language problems. */
  validate?(value: ContentMap[K]): string[];
}

/** Standard page header: label, two-part headline, short introduction. */
export interface PageHeader {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  intro: string;
}

/** A titled paragraph in a numbered list. */
export interface TitledPoint {
  title: string;
  description: string;
}

/** Section heading + paragraph, used above lists on several pages. */
export interface SectionIntro {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  body: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/* ─── About ─────────────────────────────────────────────────────────────── */

export interface AboutHero {
  kicker: string;
  lineOne: string;
  lineTwoLead: string;
  lineTwoEmphasis: string;
  lineTwoTail: string;
  lede: string;
  ledeAccent: string;
  linkLabel: string;
}
export interface AboutStudio {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  headingTail: string;
  body: string;
}
export interface AboutPoints extends SectionIntro {
  items: TitledPoint[];
}
export interface AboutStandards extends AboutPoints {
  linkLabel: string;
}
export interface AboutCta {
  headingLead: string;
  headingEmphasis: string;
  body: string;
  primaryLabel: string;
  phoneLabel: string;
}

/* ─── Services ──────────────────────────────────────────────────────────── */

export interface ServicesHero {
  kicker: string;
  lineOne: string;
  lineTwoLead: string;
  lineTwoEmphasis: string;
  estimateLabel: string;
  browseLabel: string;
}
export interface ServicesTagline {
  prefix: string;
  connector: string;
  pairs: { top: string; bottom: string }[];
}
export interface ServicesDomains {
  items: {
    id: string;
    eyebrow: string;
    headingLead: string;
    headingEmphasis: string;
    body: string;
  }[];
}
export interface ServicesDeliverables extends SectionIntro {
  items: { label: string; desc: string }[];
}
export interface ServicesTiers extends SectionIntro {
  featuredLabel: string;
  linkLabel: string;
  items: {
    label: string;
    tagline: string;
    description: string;
    includes: string[];
    featured: boolean;
  }[];
}
export interface ServicesFaq extends SectionIntro {
  items: FaqEntry[];
}

/* ─── Contact ───────────────────────────────────────────────────────────── */

export interface ContactHero {
  kicker: string;
  lineLead: string;
  lineEmphasis: string;
  lede: string;
}
export interface ContactDetails {
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  whatsappMessage: string;
  studioLabel: string;
  hoursLabel: string;
  estimatorLink: string;
  quizLink: string;
}
export interface ContactMap {
  eyebrow: string;
  openLabel: string;
  embedUrl: string;
  openUrl: string;
}
export interface ContactFaq extends SectionIntro {
  items: FaqEntry[];
}

/* ─── Site-wide: footer call-to-action and 404 ─────────────────────────── */

export interface AboutFounder {
  name: string;
  jobTitle: string;
  /** Optional profile address added to the page's search-engine data. */
  linkedinUrl: string;
}

export interface FooterCtaEntry {
  /** Exact path, or a prefix ending in * (e.g. /services/*). */
  path: string;
  headlineStart: string;
  headlineHighlight: string;
  sub: string;
}
export interface FooterCta {
  fallbackStart: string;
  fallbackHighlight: string;
  fallbackSub: string;
  items: FooterCtaEntry[];
}
export interface NotFoundCopy {
  eyebrow: string;
  headingLead: string;
  headingEmphasis: string;
  bodyBefore: string;
  bodyAfter: string;
  homeLabel: string;
  contactLabel: string;
  tryInsteadLabel: string;
}

/* ─── Portfolio / Gallery / Blog ────────────────────────────────────────── */

export interface PageContentMap {
  "about.seo": PageSeo;
  "about.hero": AboutHero;
  "about.studio": AboutStudio;
  "about.values": AboutPoints;
  "about.standards": AboutStandards;
  "about.team": SectionIntro;
  "about.cta": AboutCta;
  "services.seo": PageSeo;
  "services.hero": ServicesHero;
  "services.tagline": ServicesTagline;
  "services.domains": ServicesDomains;
  "services.deliverables": ServicesDeliverables;
  "services.tiers": ServicesTiers;
  "services.faq": ServicesFaq;
  "contact.seo": PageSeo;
  "contact.hero": ContactHero;
  "contact.details": ContactDetails;
  "contact.map": ContactMap;
  "contact.faq": ContactFaq;
  "portfolio.seo": PageSeo;
  "portfolio.header": PageHeader;
  "gallery.seo": PageSeo;
  "gallery.header": PageHeader;
  "blog.seo": PageSeo;
  "blog.header": PageHeader;
  "about.founder": AboutFounder;
  "site.footer_cta": FooterCta;
  "site.not_found": NotFoundCopy;
}
