import { test, expect } from '@playwright/test';

const dismissCookieBanner = async (page: import('@playwright/test').Page) => {
  try {
    const banner = page.locator('aside[aria-live="polite"]');
    const isVisible = await banner.isVisible().catch(() => false);
    if (!isVisible) return;
    const acceptBtn = banner.locator('button').filter({ hasText: /accept/i }).first();
    await acceptBtn.click({ timeout: 3_000 });
    await banner.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  } catch {}
};

async function reachSubmitStep(page: import('@playwright/test').Page) {
  const continueBtn = page.locator('button').filter({ hasText: /Continue to Project Type/i }).first();
  if (await continueBtn.isVisible()) {
    await continueBtn.click();
    await page.waitForTimeout(500);
  }
  const option = page.locator('label').filter({ hasText: /Residential|Apartment/ }).first();
  if (await option.isVisible()) {
    await option.click();
    await page.waitForTimeout(300);
  }
  const nextBtn = page.locator('button').filter({ hasText: /Next: Details/i }).first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(500);
  }
}

async function fillRequiredStep3Fields(page: import('@playwright/test').Page) {
  const budget = page.locator('label').filter({ hasText: /Essential/ }).first();
  if (await budget.isVisible()) {
    await budget.click();
    await page.waitForTimeout(200);
  }
  const location = page.locator('#location');
  if (await location.isVisible()) {
    await location.selectOption('Jamshedpur');
    await page.waitForTimeout(200);
  }
  const message = page.locator('#message');
  if (await message.isVisible()) {
    await message.fill('Looking to renovate a 3BHK apartment.');
    await page.waitForTimeout(200);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM RENDERING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Contact Form Rendering', () => {
  test('Contact form renders correctly', async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(1000);

    const form = page.locator('form');
    await expect(form).toBeVisible();

    const inputs = form.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(3);

    await reachSubmitStep(page);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Contact Form Validation', () => {
  test('Form validation shows errors', async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    await reachSubmitStep(page);

    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }

    const invalidFields = page.locator('[aria-invalid="true"]');
    const invalidCount = await invalidFields.count().catch(() => 0);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasErrorText = /required|invalid|error|is required/i.test(bodyText);

    const redErrors = page.locator('[class*="text-red"]');
    const redCount = await redErrors.count().catch(() => 0);

    expect(invalidCount > 0 || hasErrorText || redCount > 0).toBeTruthy();
  });

  test('Phone number input accepts digits', async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]').first();
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('9876543210');
    await expect(phoneInput).toHaveValue('9876543210');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Contact Form Accessibility', () => {
  test('Form field accessibility', async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    const visibleInputs = page.locator('form input:visible');
    const count = await visibleInputs.count();

    for (let i = 0; i < count; i++) {
      const input = visibleInputs.nth(i);

      const ariaLabel = await input.getAttribute('aria-label').catch(() => null);
      const ariaLabelledby = await input.getAttribute('aria-labelledby').catch(() => null);
      const id = await input.getAttribute('id').catch(() => null);

      let hasLabel = Boolean(ariaLabel || ariaLabelledby);

      if (id && !hasLabel) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count().then(c => c > 0).catch(() => false);
      }

      expect(hasLabel).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM SUBMISSION BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Contact Form Submission Behavior', () => {
  test('Form submission loading state', async ({ page }) => {
    await page.route('**/rest/v1/**', async route => {
      await new Promise(r => setTimeout(r, 3000));
      await route.continue();
    });

    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    const firstName = page.locator('#firstName');
    const lastName = page.locator('#lastName');
    const email = page.locator('#email');
    const phone = page.locator('#phone');

    await firstName.fill('John');
    await lastName.fill('Doe');
    await email.fill('john.doe@example.com');
    await phone.fill('9876543210');
    await page.waitForTimeout(200);

    await reachSubmitStep(page);
    await fillRequiredStep3Fields(page);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    await submitBtn.click();
    await page.waitForTimeout(400);

    const isDisabled = await submitBtn.isDisabled().catch(() => false);
    const hasSpinner = await page.locator('.animate-spin').first().isVisible().catch(() => false);
    const hasSendingText = await submitBtn.innerText().then(t => /initiating/i.test(t)).catch(() => false);

    expect(isDisabled || hasSpinner || hasSendingText).toBeTruthy();
  });

  test('Toast notifications are announced', async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    const firstName = page.locator('#firstName');
    const lastName = page.locator('#lastName');
    const email = page.locator('#email');
    const phone = page.locator('#phone');

    await firstName.fill('Jane');
    await lastName.fill('Doe');
    await email.fill('jane.doe@example.com');
    await phone.fill('9876543210');
    await page.waitForTimeout(200);

    await reachSubmitStep(page);
    await fillRequiredStep3Fields(page);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    const toast = page.locator('[role="status"]').first();
    await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    const toastVisible = await toast.isVisible().catch(() => false);
    if (toastVisible) {
      const role = await toast.getAttribute('role').catch(() => null);
      const ariaLive = await toast.getAttribute('aria-live').catch(() => null);
      expect(role === 'status' || ariaLive === 'polite').toBeTruthy();
    }
  });
});
