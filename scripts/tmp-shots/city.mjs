import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
for (const c of ['jamshedpur','dhanbad','bistupur','kolkata']) {
  await page.goto('http://localhost:8080/locations/' + c, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const o = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,44),
    noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
    region: (()=>{ const s=[...document.querySelectorAll('script[type="application/ld+json"]')].find(x=>x.textContent.includes('LocalBusiness'));
      try { return JSON.parse(s.textContent.replace(/\u003c/g,'<')).address.addressRegion; } catch { return 'none'; } })(),
  }));
  console.log(c.padEnd(12), JSON.stringify(o));
}
await browser.close();
