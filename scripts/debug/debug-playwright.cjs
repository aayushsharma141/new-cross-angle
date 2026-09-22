const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  try {
    console.log('Navigating to /estimate');
    await page.goto('http://localhost:8080/estimate', { waitUntil: 'domcontentloaded' });
    
    console.log('Clicking Residential card');
    await page.getByRole('button', { name: /Residential/i }).first().click({ force: true });
    
    console.log('Waiting for Continue button');
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Continue button found!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'estimator-debug.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
