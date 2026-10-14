/**
 * Keeps the integration registry honest.
 *
 * The admin Settings page lists every server secret and whether it is set. That
 * is only trustworthy if the list matches what the edge functions actually
 * read, so this fails when:
 *  - a function starts reading an env var the registry has never heard of, or
 *  - the `integration-status` function checks a different set of names than
 *    the registry shows.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ALL_SECRET_NAMES, NON_INTEGRATION_ENV } from "@/lib/admin/integrations";

const FUNCTIONS_DIR = join(process.cwd(), "..", "..", "supabase", "functions");

function sourceFiles(): { file: string; src: string }[] {
  const files: { file: string; src: string }[] = [];
  for (const entry of readdirSync(FUNCTIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules") continue;
    const dir = join(FUNCTIONS_DIR, entry.name);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".ts")) continue;
      files.push({ file: `${entry.name}/${f}`, src: readFileSync(join(dir, f), "utf8") });
    }
  }
  return files;
}

function envNamesRead(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const { file, src } of sourceFiles()) {
    for (const m of src.matchAll(/Deno\.env\.get\(\s*["'`]([A-Z0-9_]+)["'`]/g)) {
      found.set(m[1], [...(found.get(m[1]) ?? []), file]);
    }
  }
  return found;
}

describe("integration secret registry", () => {
  it("finds env reads (guards against the scan silently matching nothing)", () => {
    expect(envNamesRead().size).toBeGreaterThan(15);
  });

  it("lists every env var the edge functions read", () => {
    const known = new Set<string>([...ALL_SECRET_NAMES, ...NON_INTEGRATION_ENV]);
    const unlisted = [...envNamesRead()].filter(([name]) => !known.has(name));
    expect(
      unlisted.map(([name, files]) => `${name} (read in ${[...new Set(files)].join(", ")})`),
      "Add these to INTEGRATION_REGISTRY (or NON_INTEGRATION_ENV) in lib/admin/integrations.ts",
    ).toEqual([]);
  });

  it("does not list a secret no function reads", () => {
    const read = new Set(envNamesRead().keys());
    expect(ALL_SECRET_NAMES.filter((n) => !read.has(n))).toEqual([]);
  });

  it("has no duplicate secret names", () => {
    expect(new Set(ALL_SECRET_NAMES).size).toBe(ALL_SECRET_NAMES.length);
  });

  it("is checked in full by the integration-status function", () => {
    const src = readFileSync(join(FUNCTIONS_DIR, "integration-status", "index.ts"), "utf8");
    const block = src.slice(src.indexOf("SECRET_NAMES = ["), src.indexOf("] as const"));
    const checked = [...block.matchAll(/"([A-Z0-9_]+)"/g)].map((m) => m[1]).sort();
    expect(checked).toEqual([...ALL_SECRET_NAMES].sort());
  });
});

describe("browser env example", () => {
  it("documents every VITE_ variable the app reads", () => {
    const example = readFileSync(join(process.cwd(), ".env.example"), "utf8");
    const documented = new Set([...example.matchAll(/^#?\s*(VITE_[A-Z0-9_]+)=/gm)].map((m) => m[1]));
    const used = new Set<string>();
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
          for (const m of readFileSync(full, "utf8").matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) used.add(m[1]);
        }
      }
    };
    walk(join(process.cwd(), "src"));
    expect(used.size).toBeGreaterThan(5);
    expect([...used].filter((n) => !documented.has(n))).toEqual([]);
  });
});
