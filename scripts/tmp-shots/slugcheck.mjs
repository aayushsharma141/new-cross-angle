import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/portfolio', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(async () => {
  const mod = await import('/src/lib/api/index.ts');
  const r = {};
  for (const slug of ['executive-workspace','minimalist-villa']) {
    const p = await mod.api.getProjectBySlug(slug);
    r[slug] = { brief: p?.brief?.length || 0, materials: p?.materials?.length || 0, testimonial: !!p?.testimonial, area: p?.area };
  }
  return r;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
