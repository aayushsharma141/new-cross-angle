import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900}, reducedMotion:'reduce' });
const errs = [];
page.on('pageerror', e => errs.push(e.message.slice(0,90)));
await page.goto('http://localhost:8080/locations', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const info = await page.evaluate(() => ({
  h: document.documentElement.scrollHeight,
  w: document.documentElement.scrollWidth,
  h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim(),
  bands: [...document.querySelectorAll('main h2')].map(h=>h.textContent?.trim()),
  cityLinks: document.querySelectorAll('main a[href^="/locations/"]').length,
  stats: [...document.querySelectorAll('main dt,main dd')].slice(0,8).map(d=>d.textContent?.trim()),
  schemaCount: (() => { const s=[...document.querySelectorAll('script[type="application/ld+json"]')];
    try { return JSON.parse(s.find(x=>x.textContent.includes('ItemList')).textContent).itemListElement.length; } catch { return 'n/a'; } })(),
}));
console.log(JSON.stringify({ ...info, errs }, null, 1));
await browser.close();
