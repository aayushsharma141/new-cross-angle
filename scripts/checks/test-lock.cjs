const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  
  console.log('Navigating...');
  await page.goto('http://127.0.0.1:8080/admin/crm/leads/9f644f1a-8fe9-40de-ae84-52cfe987ef35/workspace', { waitUntil: 'networkidle' });
  
  console.log('Clicking Lock Commitment...');
  await page.click('button:has-text("Lock Commitment")');
  
  console.log('Waiting 2 seconds...');
  await page.waitForTimeout(2000);
  
  console.log('Done.');
  await browser.close();
})();
