import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1600,height:1000}, reducedMotion: 'reduce' });
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const strict = page.getByRole('button', { name: /strict only/i });
if (await strict.count()) { await strict.first().click(); await page.waitForTimeout(400); }
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(80); }
await page.waitForTimeout(800);
const el = page.locator('section', { hasText: 'Two ways in' }).first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await el.screenshot({ path: `${process.env.OUT}/home-tools.png` });
// nav shot at top
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(800);
await page.screenshot({ path: `${process.env.OUT}/home-nav.png`, clip: { x: 0, y: 0, width: 1600, height: 110 } });
console.log('ok');
await browser.close();
