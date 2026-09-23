import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
const errs = [];
page.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,200)); });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0,200)));
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const out = await page.evaluate(() => ({
  h1: document.querySelector('main h1')?.textContent?.trim(),
  articles: document.querySelectorAll('main article').length,
  h2s: [...document.querySelectorAll('main h2')].map(h=>h.textContent?.trim().slice(0,40)),
  lis: document.querySelectorAll('main ul li').length,
  bodyLen: document.body.innerText.length,
}));
console.log(JSON.stringify({ ...out, errs: errs.slice(0,5) }, null, 1));
await browser.close();
