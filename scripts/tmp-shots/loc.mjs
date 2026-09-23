import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [route, name] of [['/locations','locations'],['/locations/jamshedpur','location'],['/locations/pune','location-fallback']]) {
  const page = await browser.newPage({ viewport: {width:1440,height:900}, reducedMotion:'reduce' });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,90)));
  await page.goto('http://localhost:8080' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    w: document.documentElement.scrollWidth,
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,45),
    cityLinks: document.querySelectorAll('main a[href^="/locations/"]').length,
    stats: [...document.querySelectorAll('main dt')].slice(0,4).map(d=>d.textContent?.trim()),
    schema: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
    noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
  }));
  console.log(name.padEnd(20), JSON.stringify({ ...info, errs }));
  await page.close();
}
await browser.close();
