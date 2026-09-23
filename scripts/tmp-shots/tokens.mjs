import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const el = document.createElement('div');
  el.setAttribute('data-environment', 'workspace');
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const root = getComputedStyle(document.documentElement);
  return {
    htmlClass: document.documentElement.className,
    canvasPrimary: root.getPropertyValue('--s-canvas-primary').trim(),
    textPrimary: root.getPropertyValue('--s-text-primary').trim(),
    wsSurface: cs.getPropertyValue('--m-surface').trim(),
    wsLine: cs.getPropertyValue('--m-line').trim(),
    mDetail: root.getPropertyValue('--m-detail').trim(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
