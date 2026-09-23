import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.mouse.move(1430, 880);
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const h2 = document.querySelector('main article h2');
  const h3 = document.querySelector('main ul li h3');
  return { featuredColor: h2 && getComputedStyle(h2).color, cardColor: h3 && getComputedStyle(h3).color };
});
console.log(JSON.stringify(out));
await browser.close();
