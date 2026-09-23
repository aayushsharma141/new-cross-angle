import { createRequire } from "module";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("apps/web/.env.local") });
const require = createRequire(path.resolve("package.json"));
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:8080";

const services = [
  { title: "Wardrobe" },
  { title: "Garden & Sitting Area" }
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ storageState: path.resolve("e2e/setup/.auth/admin.json"), viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  
  const settle = async () => { await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {}); await page.waitForTimeout(500); };
  
  try {
    await page.goto(BASE + "/admin/cms/services", { waitUntil: "domcontentloaded" }); 
    await settle();

    for (const svc of services) {
      console.log(`Editing service: ${svc.title}`);
      
      const card = page.locator("div, article").filter({ hasText: svc.title }).filter({ has: page.getByRole("button", { name: /Edit/ }) }).last();
      await card.getByRole("button", { name: /Edit/ }).click();
      
      await page.locator("#svc-category").click();
      await page.getByRole("option", { name: "Specialized" }).click();

      await page.getByRole("button", { name: /^Update$/ }).click(); 
      await settle();
      console.log(`Updated ${svc.title} to Specialized category`);
    }
  } catch (err) {
    console.error("Execution error:", err);
  } finally {
    await browser.close();
  }
})();
