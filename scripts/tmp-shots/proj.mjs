import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const slug of ['executive-workspace','minimalist-villa','no-such-project']) {
  const page = await browser.newPage({ viewport: {width:1440,height:900}, reducedMotion: 'reduce' });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,90)));
  await page.goto('http://localhost:8080/portfolio/' + slug, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    w: document.documentElement.scrollWidth,
    h1: document.querySelector('h1')?.textContent?.trim().slice(0,40),
    facts: [...document.querySelectorAll('main dl dt')].map(d=>d.textContent?.trim()),
    sections: [...document.querySelectorAll('main h2')].map(h=>h.textContent?.replace(/\s+/g,' ').trim().slice(0,32)),
    galleryImgs: document.querySelectorAll('main section ul li img').length,
    prevNext: [...document.querySelectorAll('main a[href^="/portfolio/"]')].length,
  }));
  console.log(slug.padEnd(20), JSON.stringify({ ...info, errs }));
  await page.close();
}
await browser.close();
