import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const cards = await page.evaluate(() => [...document.querySelectorAll('main ul li')].map(li => ({
  title: li.querySelector('h3')?.textContent?.trim().slice(0,45),
  meta: li.querySelector('p')?.textContent?.replace(/\s+/g,' ').trim().slice(0,50),
  href: li.querySelector('a')?.getAttribute('href'),
})));
console.log(JSON.stringify(cards, null, 1));
await browser.close();
