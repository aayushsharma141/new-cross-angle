import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CONTENT_BLOCKS,
  getBlockDef,
  isSafeAddress,
  normalizeBlock,
  validateBlock,
} from "@/content/registry";

describe("site content registry", () => {
  it("every block's defaults pass its own validation", () => {
    for (const def of CONTENT_BLOCKS) {
      expect(validateBlock(def, def.defaults), def.key).toEqual([]);
    }
  });

  it("block keys are unique and match the database key format", () => {
    const keys = CONTENT_BLOCKS.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k).toMatch(/^[a-z0-9_]+(\.[a-z0-9_]+)*$/);
  });

  it("falls back to defaults when nothing is published", () => {
    const def = getBlockDef("home.gallery_cta");
    expect(normalizeBlock(def, undefined)).toEqual(def.defaults);
    expect(normalizeBlock(def, null)).toEqual(def.defaults);
    expect(normalizeBlock(def, "garbage")).toEqual(def.defaults);
  });

  it("keeps edited fields and fills the rest from defaults", () => {
    const def = getBlockDef("home.gallery_cta");
    const out = normalizeBlock(def, { heading: "See our work" });
    expect(out.heading).toBe("See our work");
    expect(out.linkHref).toBe(def.defaults.linkHref);
  });

  it("replaces wrong-typed fields instead of passing them to the page", () => {
    const def = getBlockDef("home.faq");
    const out = normalizeBlock(def, { headingLead: 42, items: [{ question: ["x"], answer: "A" }, "nope"] });
    expect(out.headingLead).toBe(def.defaults.headingLead);
    expect(out.items).toHaveLength(1);
    expect(out.items[0]).toEqual({ question: "", answer: "A" });
  });

  it("an editor can publish an empty list, e.g. removing every FAQ", () => {
    const def = getBlockDef("home.faq");
    expect(normalizeBlock(def, { items: [] }).items).toEqual([]);
  });

  it("flags required fields, including inside list items", () => {
    const def = getBlockDef("home.faq");
    const problems = validateBlock(def, { headingLead: "", items: [{ question: "Q", answer: "" }] });
    expect(problems).toContain("Heading is required");
    expect(problems).toContain("Question 1 › Answer is required");
  });

  it("normalising a block's own defaults changes nothing (every field type is handled)", () => {
    for (const def of CONTENT_BLOCKS) {
      expect(normalizeBlock(def, def.defaults), def.key).toEqual(def.defaults);
    }
  });

  it("legal documents keep every built-in section and a footer note", () => {
    const privacy = getBlockDef("legal.privacy");
    const terms = getBlockDef("legal.terms");
    expect(normalizeBlock(privacy, undefined).sections).toHaveLength(7);
    expect(normalizeBlock(terms, undefined).sections).toHaveLength(11);
    expect(normalizeBlock(privacy, undefined).footerNote).toContain("/terms");
    expect(normalizeBlock(terms, undefined).intro).not.toBe("");
  });

  it("rejects duplicate or malformed area links on the Locations page", () => {
    const def = getBlockDef("locations.areas");
    const area = (slug: string) => ({ slug, name: "A", context: "", focus: "", copy: "" });
    const value = {
      bands: [
        { id: "home", label: "Home", note: "", areas: [area("bistupur"), area("bistupur"), area("Bad Slug")] },
      ],
    };
    const problems = validateBlock(def, value);
    expect(problems.some((p) => p.includes("used twice"))).toBe(true);
    expect(problems.some((p) => p.includes("lowercase letters"))).toBe(true);
    expect(validateBlock(def, def.defaults)).toEqual([]);
  });

  it("keeps the highlighted pricing level a real boolean, and rejects non-Google map addresses", () => {
    const tiers = getBlockDef("services.tiers");
    const out = normalizeBlock(tiers, { items: [{ label: "A", featured: "yes" }, { label: "B", featured: true }] });
    expect(out.items.map((t) => t.featured)).toEqual([false, true]);

    const map = getBlockDef("contact.map");
    expect(validateBlock(map, map.defaults)).toEqual([]);
    expect(validateBlock(map, { ...map.defaults, embedUrl: "https://evil.example/embed" })).toContain(
      "Map embed address must be an https Google Maps address",
    );
    expect(validateBlock(map, { ...map.defaults, embedUrl: "javascript:alert(1)" }).length).toBeGreaterThan(0);
  });

  it("every public page has editable search text", () => {
    const keys = CONTENT_BLOCKS.map((b) => b.key);
    for (const page of ["home", "about", "services", "contact", "portfolio", "gallery", "blog", "process", "locations"]) {
      expect(keys, page).toContain(`${page}.seo`);
    }
    expect(keys).toContain("legal.privacy");
    expect(keys).toContain("legal.terms");
  });

  it("rejects unsafe link addresses", () => {
    expect(isSafeAddress("/estimate")).toBe(true);
    expect(isSafeAddress("https://example.com/x")).toBe(true);
    expect(isSafeAddress("mailto:hello@example.com")).toBe(true);
    expect(isSafeAddress("javascript:alert(1)")).toBe(false);
    expect(isSafeAddress("//evil.example")).toBe(false);
    expect(isSafeAddress("data:text/html,x")).toBe(false);

    const def = getBlockDef("home.gallery_cta");
    expect(validateBlock(def, { ...def.defaults, linkHref: "javascript:alert(1)" })).toContain(
      "Link address must start with / or https://",
    );
  });
});

describe("site content migration", () => {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../../../../supabase/migrations/20261013000000_site_content.sql"),
    "utf-8",
  );

  it("never grants write access on the content tables to client roles", () => {
    expect(sql).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|ALL)[^;]*site_content/i);
  });

  it("keeps drafts and history away from anonymous visitors", () => {
    expect(sql).toMatch(/GRANT SELECT ON public\.site_content TO anon, authenticated/);
    expect(sql).toMatch(/GRANT SELECT ON public\.site_content_drafts, public\.site_content_versions TO authenticated/);
  });

  it("every write function checks for super_admin", () => {
    const fns = sql.split("CREATE OR REPLACE FUNCTION").slice(1);
    expect(fns.length).toBe(5);
    for (const fn of fns) expect(fn).toMatch(/has_role\(auth\.uid\(\), 'super_admin'\)/);
  });
});
