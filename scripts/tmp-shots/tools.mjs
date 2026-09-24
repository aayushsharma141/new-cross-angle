import { chromium } from 'playwright';
const browser = await chromium.launch();
const errs = [];
const page = await browser.newPage({ viewport: {width:1440,height:900} });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0,140)));
page.on('console', m => { if (m.type()==='error' && !/401|ERR_CONNECTION|favicon/.test(m.text())) errs.push(m.text().slice(0,140)); });

// ---- Estimate ----
await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
const est = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,60),
  doors: [...document.querySelectorAll('main ul > li h2')].map(h=>h.textContent?.trim()),
  bg: getComputedStyle(document.querySelector('[data-environment=workspace]')).backgroundColor,
  backLink: !!document.querySelector('a[href="/"]'),
  crossLink: !!document.querySelector('a[href="/aesthetic-discovery-engine"]'),
}));
// start the estimator flow
await page.getByRole('button', { name: /estimate/i }).first().click();
await page.waitForTimeout(1500);
const started = await page.evaluate(() => document.body.innerText.length > 100 && !document.querySelector('h1')?.textContent?.includes('actually costs'));

// ---- Discovery ----
await page.goto('http://localhost:8080/aesthetic-discovery-engine', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
const disc = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,60),
  doors: [...document.querySelectorAll('main ul > li h2')].map(h=>h.textContent?.trim()),
  crossLink: !!document.querySelector('a[href="/estimate"]'),
  langToggle: [...document.querySelectorAll('button')].some(b=>b.textContent==='Hinglish'),
}));
// quick quiz starts
await page.getByRole('button', { name: /3-minute quiz/i }).click();
await page.waitForTimeout(1500);
const quizStarted = await page.evaluate(() => !document.body.innerText.includes('Most tools ask what you want'));
console.log(JSON.stringify({ est, estimatorFlowStarted: started, disc, quizStarted, errs: errs.slice(0,4) }, null, 1));
await browser.close();
