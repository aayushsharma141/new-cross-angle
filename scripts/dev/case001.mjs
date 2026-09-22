import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log("Starting Case 001 simulation...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to /estimate...");
    await page.goto('http://localhost:8080/estimate', { waitUntil: 'networkidle' });
    
    // Check if we need to click "Estimate Directly"
    const hasEstimateDirectly = await page.getByRole('button', { name: /Estimate Directly/i }).isVisible();
    if (hasEstimateDirectly) {
      console.log("Clicking 'Estimate Directly'...");
      await page.getByRole('button', { name: /Estimate Directly/i }).click();
    }

    // Step 0: Property Type
    console.log("Step 0: Property Type");
    await page.getByText('Apartment', { exact: true }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Property Details
    console.log("Step 1: Property Details");
    await page.getByText('2 BHK', { exact: true }).click();
    // Area input (placeholder might be like "Carpet Area")
    // Let's just find the first number input.
    const numberInputs = await page.locator('input[type="number"]').all();
    if (numberInputs.length > 0) {
      await numberInputs[0].fill('1100');
    }
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Location
    console.log("Step 2: Location");
    // Just pick the first state/city if available or try to click "Maharashtra".
    // Alternatively, just click Continue if there are defaults.
    try {
      await page.getByRole('combobox').first().selectOption({ label: 'Maharashtra' });
      await page.getByRole('combobox').nth(1).selectOption({ label: 'Mumbai' });
    } catch(e) {}
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Investment
    console.log("Step 3: Investment");
    try {
        await page.getByText(/Mid-range/i).click();
    } catch(e) {}
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Services
    console.log("Step 4: Services");
    try {
        await page.getByText(/Core/i).first().click();
    } catch(e) {}
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Addons / Bespoke
    console.log("Step 5: Addons");
    try {
        const textareas = await page.locator('textarea').all();
        if (textareas.length > 0) {
            await textareas[0].fill("Existing plumbing remains, kitchen footprint unchanged, no structural modifications");
        }
    } catch(e) {}
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 6: Timeline & Contact
    console.log("Step 6: Timeline");
    try {
        await page.getByText(/3-4 months/i).click();
    } catch (e) {}

    // Fill contact details
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').all();
    for (let input of inputs) {
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        if (type === 'email' || (name && name.includes('email'))) {
            await input.fill(`client-fc001-${Date.now()}@example.com`);
        } else if (type === 'tel' || (name && name.includes('phone'))) {
            await input.fill('9876543210');
        } else {
            await input.fill('Client FC001');
        }
    }
    
    console.log("Submitting...");
    await page.getByRole('button', { name: /Get Estimate/i }).click();

    // Wait for result page
    console.log("Waiting for results...");
    await page.waitForTimeout(5000); // give it time to submit
    const resultsHtml = await page.content();
    if (resultsHtml.includes("Estimate") || resultsHtml.includes("Total")) {
        console.log("Successfully generated estimate.");
    }
    
    // Now simulate Designer side
    console.log("Designer logging in...");
    await page.goto('http://localhost:8080/admin/auth', { waitUntil: 'networkidle' });
    
    // Try to login
    const emailInput = await page.getByRole('textbox', { name: /email/i }).first();
    const passwordInput = await page.getByLabel(/password/i).first(); // might fail if no aria-label
    // fallback
    const allInputs = await page.locator('input').all();
    if (allInputs.length >= 2) {
        await allInputs[0].fill('admin@crossangle.com');
        await allInputs[1].fill('Password123!');
        await page.getByRole('button', { name: /sign in|log in|login/i }).click();
        await page.waitForTimeout(3000);
    }
    
    console.log("Checking if logged in...");
    if (page.url().includes('workspace')) {
        console.log("Designer logged in successfully!");
    } else {
        console.log("Designer failed to log in. URL:", page.url());
    }

  } catch (err) {
    console.error("Error during simulation:", err);
  } finally {
    await browser.close();
  }
})();
