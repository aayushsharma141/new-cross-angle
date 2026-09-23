import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:1440,height:900} });
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const raw = await page.evaluate(async () => {
  const r = await fetch('/api/supabase/rest/v1/blog_posts?select=title,excerpt,category&limit=3', { headers: { apikey: '' } }).catch(()=>null);
  return r ? 'fetch-ok' : 'no';
});
const excerpts = await page.evaluate(() => [...document.querySelectorAll('main ul li p')].map(p => p.textContent?.trim()).filter(t => t && t.length > 25).slice(0,4));
console.log(JSON.stringify({ raw, excerpts }, null, 1));
await browser.close();
