// DEF-001 end-to-end verification via the real Services CMS UI (create -> edit -> delete) using the saved
// Playwright admin session (e2e/setup/.auth/admin.json, produced by `npx playwright test --project=setup` / any e2e run).
// Prereqs: dev server on http://localhost:8080; migration 20260915000000 applied (scripts/checks/probe-upsert-service.mjs -> PASS).
// Usage (repo root): node scripts/checks/verify-def001-services-crud.mjs
// Writes exactly one row named "[QA-2026-09-15] DEF-001 Service" and deletes it again; exits 1 if create fails.
// DEF-001 end-to-end: create -> verify row -> edit -> verify -> delete -> verify gone, via the real Services CMS UI.
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("apps/web/.env.local") });
const require = createRequire(path.resolve("package.json"));
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:8080";
const U = process.env.VITE_SUPABASE_URL, A = process.env.VITE_SUPABASE_ANON_KEY;
const H = { apikey: A, Authorization: `Bearer ${A}` };
const TITLE = "[QA-2026-09-15] DEF-001 Service", SLUG = "qa-2026-09-15-def001-service";
const readSvc = async () => { const r = await fetch(`${U}/rest/v1/services?slug=eq.${SLUG}&select=id,name,short_tag,active`, { headers: H }); return (await r.json())[0] ?? null; };
const OUT = path.resolve("test-results/def001");

fs.mkdirSync(OUT, { recursive: true });
console.log("pre-existing QA row:", (await readSvc()) ? "YES (will still proceed)" : "none");
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: path.resolve("e2e/setup/.auth/admin.json"), viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const rpc = []; page.on("response", async (r) => { if (r.url().includes("/rpc/upsert_service")) { let b = ""; try { b = (await r.text()).slice(0, 160); } catch {} rpc.push(`${r.status()} ${b}`); } });
const settle = async () => { await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {}); await page.waitForTimeout(500); };

await page.goto(BASE + "/admin/cms/services", { waitUntil: "domcontentloaded" }); await settle();
const thumbs = await page.locator("img").evaluateAll((imgs) => imgs.filter((i) => i.naturalWidth > 0 && /imagekit|supabase|unsplash|http/.test(i.src)).length);
console.log("service thumbnails rendered from asset_usages:", thumbs);

// CREATE
await page.getByText("Add a new service").first().click();
await page.locator("#svc-title").fill(TITLE);
await page.locator("#svc-slug").fill(SLUG);
await page.locator("#service-description").fill("QA verification row — safe to delete.");
await page.locator("#service-tag").fill("QA");
await page.getByRole("button", { name: /^Create$/ }).click(); await settle();
let row = await readSvc();
console.log("CREATE rpc:", rpc.at(-1) ?? "no rpc response captured", "| row:", row ? `id=${row.id} tag=${row.short_tag}` : "ABSENT");
await page.screenshot({ path: `${OUT}/def001_after_create.png` });
if (!row) { console.log("STOP: create failed"); await browser.close(); process.exit(1); }

// EDIT
const card = page.locator("div, article").filter({ hasText: TITLE }).filter({ has: page.getByRole("button", { name: /Edit/ }) }).last();
await card.getByRole("button", { name: /Edit/ }).click();
await page.locator("#service-tag").fill("QA-EDITED");
await page.getByRole("button", { name: /^Update$/ }).click(); await settle();
row = await readSvc();
console.log("EDIT rpc:", rpc.at(-1), "| row tag now:", row?.short_tag);

// DELETE (two-step AdminSafeAction: Delete -> "Yes")
const card2 = page.locator("div, article").filter({ hasText: TITLE }).filter({ has: page.getByRole("button", { name: /Delete/ }) }).last();
await card2.getByRole("button", { name: /Delete/ }).click();
await card2.getByRole("button", { name: /^Yes$/ }).click(); await settle();
row = await readSvc();
console.log("DELETE -> row:", row ? "STILL PRESENT" : "gone");
const leftovers = await fetch(`${U}/rest/v1/services?name=like.*QA-2026*&select=id`, { headers: H }).then((r) => r.json());
console.log("QA leftovers in services:", JSON.stringify(leftovers));
await browser.close();
