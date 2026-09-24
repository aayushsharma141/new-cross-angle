import { chromium } from 'playwright';
const browser = await chromium.launch();
const errs = [];
const page = await browser.newPage({ viewport: {width:1600,height:900} });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0,140)));
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const strict = page.getByRole('button', { name: /strict only/i });
if (await strict.count()) { await strict.first().click(); await page.waitForTimeout(400); }
const nav = await page.evaluate(() => ({
  quizLink: !!document.querySelector('header a[href="/aesthetic-discovery-engine"]'),
  estimateLink: !!document.querySelector('header a[href="/estimate"]'),
}));
// scroll to tools chapter
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(90); }
await page.waitForTimeout(900);
const tools = await page.evaluate(() => {
  const heads = [...document.querySelectorAll('main h2, main h3')].map(h=>h.textContent?.replace(/\s+/g,' ').trim());
  return {
    hasTwoWaysIn: heads.some(t => t?.includes('Two ways in')),
    toolTitles: heads.filter(t => t?.includes('design identity') || t?.includes('actually costs')),
    quizCta: !!document.querySelector('main a[href="/aesthetic-discovery-engine"]'),
    estimateCta: !!document.querySelector('main a[href="/estimate"]'),
  };
});
console.log(JSON.stringify({ nav, tools, errs: errs.slice(0,3) }, null, 1));
await browser.close();
