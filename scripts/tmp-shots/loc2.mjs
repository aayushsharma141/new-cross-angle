import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900}, reducedMotion:'reduce' });
const errs = [];
page.on('pageerror', e => errs.push(e.message.slice(0,90)));

await page.goto('http://localhost:8080/locations', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const main = await page.evaluate(() => ({
  h: document.documentElement.scrollHeight,
  w: document.documentElement.scrollWidth,
  h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim(),
  areas: document.querySelectorAll('main article[id]').length,
  jumpLinks: document.querySelectorAll('main nav a[href^="#"]').length,
  words: document.querySelector('main').innerText.split(/\s+/).length,
  bands: [...document.querySelectorAll('main h2')].map(h=>h.textContent?.trim()),
}));
console.log('locations       ', JSON.stringify({ ...main, errs }));

// redirects
for (const slug of ['bistupur','ranchi','jamshedpur','nowhere-city']) {
  await page.goto('http://localhost:8080/locations/' + slug, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  console.log(('/' + slug).padEnd(18), page.url().replace('http://localhost:8080',''));
}
await browser.close();
