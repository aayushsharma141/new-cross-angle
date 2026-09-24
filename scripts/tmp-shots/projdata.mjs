import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/portfolio', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const data = await page.evaluate(async () => {
  const mod = await import('/src/lib/api/index.ts');
  const all = await mod.api.getProjects();
  return all.map(p => ({
    slug: p.slug, area: p.area, budget: p.budget, duration: p.duration,
    brief: p.brief?.length || 0, approach: p.approach?.length || 0,
    materials: p.materials?.length || 0,
    galleryImgs: (p.gallery||[]).reduce((n,g)=>n+(g.images?.length||0),0),
    testimonial: !!p.testimonial,
  }));
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
