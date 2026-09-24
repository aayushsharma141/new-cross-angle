import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [1280, 1440, 1600]) {
  const page = await browser.newPage({ viewport: {width:w,height:900} });
  await page.goto('http://localhost:8080/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const out = await page.evaluate(() => {
    const rail = [...document.querySelectorAll('div')].find(d => { const c = getComputedStyle(d); return c.position === 'fixed' && parseFloat(c.left) === 0 && d.querySelectorAll('a').length >= 3 && d.getBoundingClientRect().width < 120; });
    const body = document.querySelector('main p');
    return { rail: rail ? rail.getBoundingClientRect().right : null, contentLeft: body?.getBoundingClientRect().left };
  });
  console.log(w, JSON.stringify(out));
  await page.close();
}
await browser.close();
