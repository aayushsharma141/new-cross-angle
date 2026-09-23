import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
for (const r of ['/locations/jamshedpur','/portfolio/executive-workspace','/about-us']) {
  await page.goto('http://localhost:8080' + r, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const out = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    return { count: scripts.length, types: scripts.map(s => { try { return JSON.parse(s.textContent.replace(/\u003c/g,'<'))['@type']; } catch { return 'unparsed'; } }) };
  });
  console.log(r.padEnd(32), JSON.stringify(out));
}
await browser.close();
