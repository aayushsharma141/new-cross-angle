import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/gallery', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// pick a tile in the LAST group (worst case for index mapping)
const buttons = page.locator('main section section ul li button');
const n = await buttons.count();
for (const idx of [0, 5, n - 1]) {
  const btn = buttons.nth(idx);
  const label = await btn.getAttribute('aria-label');
  const src = await btn.locator('img').getAttribute('src');
  await btn.click();
  await page.waitForTimeout(900);
  const lbImgs = await page.locator('body > div img, [role=dialog] img').evaluateAll(els =>
    els.map(e => ({ src: e.getAttribute('src'), w: e.getBoundingClientRect().width })).filter(o => o.w > 300));
  console.log(JSON.stringify({ idx, label, tileSrc: src?.slice(-45), lightboxSrcs: lbImgs.map(i => i.src?.slice(-45)) }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
}
await browser.close();
