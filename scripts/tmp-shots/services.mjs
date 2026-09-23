import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
const errs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_CONNECTION|401/.test(m.text())) errs.push(m.text().slice(0,120)); });
await page.goto('http://localhost:8080/services', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
const domains = {};
for (const id of ['residential','commercial','specialized']) {
  domains[id] = await page.locator(`#${id} ul li h3`).count();
}
const firstLink = await page.locator('#residential ul li a').first().getAttribute('href');
const imgOk = await page.locator('#residential ul li img').first().evaluate(i => i.naturalWidth > 0).catch(() => 'no-img');
// FAQ accordion
const faqBtn = page.locator('#services-faq-trigger-1');
const before = await page.locator('#services-faq-panel-1').count();
await faqBtn.click();
await page.waitForTimeout(600);
const after = await page.locator('#services-faq-panel-1').count();
// deep-link scroll
await page.goto('http://localhost:8080/services?category=commercial', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const scrolled = await page.evaluate(() => window.scrollY > 500);
console.log(JSON.stringify({ domains, firstLink, imgOk, faqPanelBefore: before, faqPanelAfter: after, deepLinkScrolled: scrolled, errs: errs.slice(0,4) }, null, 1));
await browser.close();
