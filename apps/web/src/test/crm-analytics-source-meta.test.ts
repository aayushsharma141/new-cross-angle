/**
 * Regression guard for the CRM Analytics crash.
 *
 * `/admin/crm/analytics` went down in production because `SOURCE_META` had no
 * `other` entry while `normalizeSource` returns `"other"` as its fallback. Every
 * lookup site then read `.icon` / `.label` off `undefined` and took the whole
 * page with it — two live leads (`other`, `workspace_studio`) were enough.
 *
 * The invariant that matters: every value `lead_source_enum` can hold must
 * normalise to a key that resolves to a renderable meta object.
 */
import { describe, it, expect } from "vitest";
import { normalizeSource, getSourceMeta } from "@/pages/admin/CrmAnalytics";

/** public.lead_source_enum, as introspected from the live database. */
const LEAD_SOURCE_ENUM = [
  "website_contact",
  "estimator",
  "style_quiz",
  "whatsapp",
  "instagram",
  "referral",
  "other",
  "aesthetic_discovery_engine",
  "welcome_popup",
  "workspace_studio",
] as const;

/** Free-text values seen in the separate `leads.source` column, plus junk. */
const LOOSE_VALUES = [
  null,
  undefined,
  "",
  "   ",
  "Google",
  "contact-form",
  "ORGANIC",
  "some-channel-nobody-added-yet",
];

describe("CrmAnalytics source metadata", () => {
  it("resolves renderable meta for every lead_source_enum value", () => {
    for (const src of LEAD_SOURCE_ENUM) {
      const meta = getSourceMeta(normalizeSource(src));
      expect(meta, `no meta for lead_source "${src}"`).toBeDefined();
      expect(typeof meta.label, `label missing for "${src}"`).toBe("string");
      expect(meta.icon, `icon missing for "${src}"`).toBeTruthy();
    }
  });

  it("never returns undefined for unmapped, empty or null sources", () => {
    for (const src of LOOSE_VALUES) {
      const meta = getSourceMeta(normalizeSource(src));
      expect(meta, `no meta for source ${JSON.stringify(src)}`).toBeDefined();
      expect(typeof meta.label).toBe("string");
    }
  });

  it("attributes the channels that previously fell through to the crash path", () => {
    expect(getSourceMeta(normalizeSource("workspace_studio")).label).toBe("Workspace Studio");
    expect(getSourceMeta(normalizeSource("other")).label).toBe("Other");
    // style_quiz and aesthetic_discovery_engine are both the Discovery channel
    expect(normalizeSource("style_quiz")).toBe("discovery_engine");
    expect(normalizeSource("aesthetic_discovery_engine")).toBe("discovery_engine");
  });
});
