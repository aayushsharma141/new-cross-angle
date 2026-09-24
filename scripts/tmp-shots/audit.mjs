import { chromium } from 'playwright';
const ROUTES = [
  ['/portfolio/executive-workspace', 'project'],
  ['/blog/color-trends-bold-palettes', 'blogdetail'],
  ['/services/residential', 'servicecat'],
  ['/services/residential/living-room', 'servicedetail'],
  ['/locations', 'locations'],
  ['/locations/jamshedpur', 'location'],
  ['/privacy', 'privacy'],
  ['/terms', 'terms'],
  ['/no-such-page-xyz', 'notfound'],
];
const browser = await chromium.launch();
for (const [route, name] of ROUTES) {
  const page = await browser.newPage({ viewport: {width:1440,height:900}, reducedMotion: 'reduce' });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,80)));
  try {
    await page.goto('http://localhost:8080' + route, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const main = document.querySelector('main');
      const h1 = document.querySelector('h1');
      const cs = h1 && getComputedStyle(h1);
      return {
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        sections: document.querySelectorAll('main section').length,
        h1: h1?.textContent?.replace(/\s+/g,' ').trim().slice(0,45),
        h1Font: cs?.fontFamily.split(',')[0].replace(/"/g,''),
        h1Size: cs?.fontSize,
        mainBg: main && getComputedStyle(main).backgroundColor,
        roundedCards: document.querySelectorAll('main [class*="rounded-2xl"],main [class*="rounded-3xl"],main [class*="rounded-\[2"]').length,
        hasNav: !!document.querySelector('header a[href="/estimate"]'),
        hasFooter: !!document.querySelector('footer'),
      };
    });
    console.log(name.padEnd(14), JSON.stringify({ ...info, errs: errs.slice(0,1) }));
  } catch (e) {
    console.log(name.padEnd(14), 'FAILED', e.message.slice(0,70));
  }
  await page.close();
}
await browser.close();
