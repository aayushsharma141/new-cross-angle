import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/about-us', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const team = [...document.querySelectorAll('main ul li')].filter(li => li.querySelector('h3')).slice(0,6).map(li => {
    const img = li.querySelector('img');
    return { name: li.querySelector('h3')?.textContent, src: img?.getAttribute('src')?.slice(0,80) ?? null, natural: img ? img.naturalWidth : null, complete: img?.complete };
  });
  return team;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
