import { createRequire } from "module";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("apps/web/.env.local") });
const require = createRequire(path.resolve("package.json"));
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:8080";

const services = [
  {
    title: "Wardrobe",
    slug: "wardrobe",
    description: "Custom wardrobes, walk-in closets, and space-efficient storage designed around your lifestyle.",
    tag: "Elegant storage, made to measure."
  },
  {
    title: "Garden & Sitting Area",
    slug: "garden-and-sitting-area",
    description: "Beautiful garden, balcony, patio, and outdoor sitting spaces designed for comfort and relaxation.",
    tag: "Outdoor spaces, thoughtfully designed."
  }
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ storageState: path.resolve("e2e/setup/.auth/admin.json"), viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  
  page.on("response", async (r) => { 
    if (!r.ok() && r.url().includes("/rpc/")) { 
      try { 
        errors.push(`Error ${r.status()} on ${r.url()}: ${await r.text()}`); 
      } catch {} 
    } 
  });
  
  const settle = async () => { await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {}); await page.waitForTimeout(500); };
  
  try {
    await page.goto(BASE + "/admin/cms/services", { waitUntil: "domcontentloaded" }); 
    await settle();

    for (const svc of services) {
      console.log(`Adding service: ${svc.title}`);
      await page.getByText("Add a new service").first().click();
      await page.locator("#svc-title").fill(svc.title);
      await page.locator("#svc-slug").fill(svc.slug);
      await page.locator("#service-description").fill(svc.description);
      await page.locator("#service-tag").fill(svc.tag);
      await page.getByRole("button", { name: /^Create$/ }).click(); 
      await settle();
      console.log(`Created ${svc.title}`);
    }
  } catch (err) {
    console.error("Execution error:", err);
    await page.screenshot({ path: path.resolve("test-results/add-services-error.png") });
  } finally {
    if (errors.length > 0) {
      console.log("Captured network errors:", errors);
    }
    await browser.close();
  }
})();
