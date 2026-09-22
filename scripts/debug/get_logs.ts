import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[console ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', exception => console.log(`[pageerror] ${exception.message}`));
  page.on('requestfailed', request => console.log(`[requestfailed] ${request.url()} - ${request.failure()?.errorText}`));
  
  await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
  
  console.log("Done");
  await browser.close();
})();
