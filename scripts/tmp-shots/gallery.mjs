import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/gallery', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const groups = await page.locator('main section section').count();
const tiles = await page.locator('main section section ul li').count();
const headings = await page.locator('main section section h2').allTextContents();
const filters = await page.locator('main button[aria-pressed]').allTextContents();
// open lightbox on the 3rd tile
const target = page.locator('main section section ul li button').nth(2);
const targetTitle = (await target.textContent())?.trim();
await target.click();
await page.waitForTimeout(800);
const lightboxOpen = await page.locator('[role="dialog"], .fixed.inset-0').count();
const lightboxText = await page.evaluate(() => document.body.innerText.split('\n').filter(Boolean).slice(0,6));
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
// filter to a category
const cat = (await page.locator('main button[aria-pressed]').nth(2).textContent())?.trim();
await page.locator('main button[aria-pressed]').nth(2).click();
await page.waitForTimeout(900);
const afterTiles = await page.locator('main section section ul li').count();
console.log(JSON.stringify({ groups, tiles, headings, filters: filters.map(f=>f.replace(/\s+/g,' ').trim()), clicked: targetTitle, lightboxOpen, lightboxText, cat, afterTiles, url: page.url() }, null, 1));
await browser.close();
