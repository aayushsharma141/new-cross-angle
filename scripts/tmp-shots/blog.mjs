import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
const errs = [];
const leadPosts = [];
page.on('console', m => { if (m.type()==='error' && !/favicon|ERR_CONNECTION|401/.test(m.text())) errs.push(m.text().slice(0,110)); });
page.on('request', r => { if (r.method()==='POST' && /leads/.test(r.url())) leadPosts.push(r.url()); });
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
const featured = await page.locator('main article h2').first().textContent();
const cards = await page.locator('main ul li h3').count();
const count = await page.locator('main span:text-matches("article")').first().textContent();
// search
await page.fill('#blog-search', 'kitchen');
await page.waitForTimeout(800);
const afterSearch = await page.locator('main ul li h3').count();
await page.fill('#blog-search', '');
await page.waitForTimeout(600);
// category filter
const cat = page.getByRole('tab', { name: /Modular Kitchens/i });
await cat.click();
await page.waitForTimeout(800);
const afterCat = await page.locator('main ul li h3').count();
const heading = await page.locator('main h2').nth(1).textContent();
// sort
await page.getByRole('button', { name: 'trending', exact: true }).click();
await page.waitForTimeout(600);
// article link
const href = await page.locator('main ul li a').first().getAttribute('href').catch(()=>null);
const catCards = await page.locator('main ul li h3').count();
// newsletter renders, not submitted
const nl = await page.locator('#newsletter-email').count();
console.log(JSON.stringify({ featured: featured?.trim().slice(0,50), cards, count: count?.trim(), afterSearch, afterCat, gridHeading: heading?.trim(), firstHref: href, cardsAfterSort: catCards, newsletterField: nl, leadPosts: leadPosts.length, errs: errs.slice(0,3) }, null, 1));
await browser.close();
