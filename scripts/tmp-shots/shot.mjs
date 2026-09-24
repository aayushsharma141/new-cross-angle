import { chromium } from 'playwright';
const [,, path, name] = process.argv;
const url = 'http://localhost:8080/' + path.replace(/^\/+/, '');
const browser = await chromium.launch();
for (const [label, vp] of [['desktop', {width:1440,height:900}], ['mobile', {width:390,height:844}]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // dismiss cookie banner (privacy-preserving option) if present
  const strict = page.getByRole('button', { name: /strict only/i });
  if (await strict.count()) { await strict.first().click(); await page.waitForTimeout(400); }
  // trigger whileInView reveals by walking the page
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += vp.height * 0.6) { await page.mouse.wheel(0, vp.height * 0.6); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${process.env.OUT}/${name}-${label}.png`, fullPage: true });
  console.log(label, 'height', await page.evaluate(() => document.documentElement.scrollHeight));
  await ctx.close();
}
await browser.close();
