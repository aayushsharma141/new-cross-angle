import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:");
  console.log(text);
  await browser.close();
})();
