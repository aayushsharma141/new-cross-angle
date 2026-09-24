import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
for (const r of ['/blog/color-trends-bold-palettes','/services/residential/living-room','/our-process','/contact-us']) {
  await page.goto('http://localhost:8080' + r, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const out = await page.evaluate(() => {
    const s = [...document.querySelectorAll('script[type="application/ld+json"]')];
    return { count: s.length, types: s.map(x => { try { return JSON.parse(x.textContent.replace(/\u003c/g,'<'))['@type']; } catch { return 'unparsed'; } }) };
  });
  console.log(r.padEnd(34), JSON.stringify(out));
}
await browser.close();
