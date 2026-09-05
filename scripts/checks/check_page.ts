import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', exception => logs.push(`[error] ${exception.message}`));
  
  try {
    await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
  } catch (e) {
    logs.push(`[navigation error] ${e}`);
  }
  
  await page.screenshot({ path: 'test_page_screenshot.png' });
  
  fs.writeFileSync('test_page_logs.txt', logs.join('\n'));
  
  console.log('Done! Check test_page_screenshot.png and test_page_logs.txt');
  await browser.close();
})();
