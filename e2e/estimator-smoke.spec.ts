import { test, expect } from '@playwright/test';

test.describe('Cost Estimator - Progressive Disclosure & Validation Smoke Test', () => {
  test('should enforce validation and show progressive disclosure', async ({ page }) => {
    // 1. Navigate to the estimator page
    await page.goto('/estimate', { waitUntil: 'commit' });
    
    // Accept cookies if present to prevent it from blocking clicks
    try {
      const acceptCookiesBtn = page.getByRole('button', { name: /Accept All/i });
      await acceptCookiesBtn.waitFor({ state: 'visible', timeout: 3000 });
      await acceptCookiesBtn.click();
    } catch (e) {
      console.log('No cookie banner found or timed out');
    }
    
    // Wait for the UI config to load (e.g. from local storage/db)
    // await page.waitForLoadState('networkidle'); // Removing this because Playwright auto-waits and networkidle can time out due to background analytics/polling.

    // Select a path to start the wizard (e.g. Residential)
    await page.getByRole('button', { name: /Residential/i }).first().click({ timeout: 15000, force: true });

    // STEP 1: Property Type Selection
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    // Initially continue should be disabled
    await expect(continueBtn).toBeDisabled();
    
    // Select a type (e.g., Apartment) - Wait for config to populate items
    await page.getByRole('radio', { name: /Apartment/i }).first().click({ timeout: 15000, force: true });
    
    // Now continue should be enabled
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click({ force: true });

    // STEP 2: Property Details (Progressive Disclosure)
    // Initially, only the configuration (BHK) should be visible, others should be hidden
    const areaLabel = page.getByText(/Carpet Area:/i);
    await expect(areaLabel).not.toBeVisible();

    // Select a BHK
    await page.getByRole('button', { name: /^3 BHK$/i }).first().click({ force: true });

    // Now progressive disclosure should reveal the area slider
    await expect(areaLabel).toBeVisible();

    // Continue to next step
    await continueBtn.click({ force: true });

    // Just a quick check to ensure we advanced to the Location step
    await expect(continueBtn).toBeDisabled();
    
    // Select state first
    await page.getByRole('button', { name: /Karnataka/i }).first().click({ force: true });
    
    // Select city
    await page.getByRole('button', { name: /Bangalore/i }).first().click({ force: true });
    
    await expect(continueBtn).toBeEnabled();
  });
});
