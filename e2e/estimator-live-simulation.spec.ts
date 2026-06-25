import { test, expect } from '@playwright/test';

test.describe('Estimator Live Simulation Panel', () => {
  test('Instant Feedback recomputation and Sandbox Controls', async ({ page }) => {
    // Navigate to the Estimator Config admin page
    await page.goto('/admin/estimator/config');
    
    // Wait for the workspace to load
    await expect(page.locator('text=Pricing Intelligence')).toBeVisible();

    // Verify the right panel shows the Live Simulation
    await expect(page.locator('text=Live Simulation')).toBeVisible();
    
    // Get the initial estimate
    const estimateContainer = page.locator('text=Total Estimate').locator('..').locator('p').nth(1);
    const initialEstimateText = await estimateContainer.innerText();
    
    // --- 1. Sandbox Mock Lead Controls ---
    // Find the input for "Area (sqft)" in the right rail
    // We target the input specifically in the Live Simulation aside
    const rightRail = page.locator('aside').filter({ hasText: 'Live Simulation' });
    const areaInput = rightRail.locator('input[type="number"]').first();
    
    await areaInput.fill('2000');
    
    // Wait for reactivity
    await page.waitForTimeout(500);
    
    // Check if the total estimate updated instantly
    const newEstimateText = await estimateContainer.innerText();
    expect(newEstimateText).not.toBe(initialEstimateText);
    
    // --- 2. Instant Feedback (Draft State) ---
    // Change a rate in the Pricing Intelligence Workspace
    // We target an input under Design Rates
    const mainWorkspace = page.locator('main');
    const designRateInput = mainWorkspace.locator('input[type="number"]').first();
    
    await designRateInput.fill('500');
    
    // Wait for reactivity
    await page.waitForTimeout(500);
    
    // Estimate should change again without saving
    const finalEstimateText = await estimateContainer.innerText();
    expect(finalEstimateText).not.toBe(newEstimateText);
    
    // --- 3. Save State Preservation ---
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).not.toBeDisabled();
    await saveButton.click();
    
    // Wait for save to complete (button becomes disabled)
    await expect(saveButton).toBeDisabled();
    
    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('text=Live Simulation')).toBeVisible();
  });
});
