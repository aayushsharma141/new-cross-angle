import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to estimator...');
    await page.goto('http://localhost:8081/estimator');
    
    // Fill out the form
    console.log('Filling form...');
    await page.getByText('Apartment').click();
    await page.getByText('3 BHK').click();
    await page.fill('input[placeholder="e.g. 1500"]', '1500');
    await page.getByText('Raw (New construction)').click();
    await page.getByText('Next').click();

    await page.getByText('Metro (Tier 1)').click();
    await page.fill('input[placeholder="e.g. Mumbai"]', 'Mumbai');
    await page.fill('input[placeholder="e.g. Maharashtra"]', 'Maharashtra');
    await page.getByText('Next').click();

    // Budget
    await page.fill('input[type="range"]', '5000000');
    // For slider, might need to dispatch event, or just click next
    await page.getByText('Next').click();

    // Timeline
    await page.getByText('1-3 Months').click();
    await page.getByText('Next').click();

    // Contact details
    console.log('Filling contact details...');
    await page.fill('input[name="name"]', 'Playwright User');
    await page.fill('input[name="email"]', 'playwright@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Submit
    console.log('Submitting...');
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Wait for success screen
    await page.waitForSelector('text=Success', { timeout: 10000 }).catch(() => console.log('No success text found, maybe redirect?'));
    console.log('Current URL:', page.url());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
