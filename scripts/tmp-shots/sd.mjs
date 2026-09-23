import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/services/residential/living-room', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => [...document.querySelectorAll('main > section, main > div')].map(s => ({
  h: Math.round(s.getBoundingClientRect().height),
  label: s.querySelector('h2,h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,32) || s.className.toString().slice(0,28),
})));
console.log(JSON.stringify(out, null, 1));
await browser.close();
