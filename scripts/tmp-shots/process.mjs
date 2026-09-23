import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
const errs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_CONNECTION|401/.test(m.text())) errs.push(m.text().slice(0,120)); });
await page.goto('http://localhost:8080/our-process', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const stages = await page.locator('#process > section').count();
const stageTitles = await page.locator('#process > section h2').allTextContents();
const metrics = await page.locator('main dl dt').count();
const faqs = await page.locator('[id^="process-faq-trigger"]').count();
const schema = await page.locator('script[type="application/ld+json"]').count();
const schemaHasFaq = await page.evaluate(() =>
  [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => s.textContent?.includes('FAQPage')));
// anchor jump
await page.locator('a[href="#process"]').first().click();
await page.waitForTimeout(1200);
const jumped = await page.evaluate(() => window.scrollY > 400);
console.log(JSON.stringify({ stages, stageTitles: stageTitles.map(t=>t.replace(/\s+/g,' ').trim()), metricLabels: metrics, faqs, schema, schemaHasFaq, anchorJumped: jumped, errs: errs.slice(0,4) }, null, 1));
await browser.close();
