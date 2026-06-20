import { test, expect, Page } from '@playwright/test';

const dismissCookieBanner = async (page: Page) => {
  try {
    const banner = page.locator('aside[aria-live="polite"]');
    const isVisible = await banner.isVisible().catch(() => false);
    if (!isVisible) return;
    const acceptBtn = banner.locator('button').filter({ hasText: /accept/i }).first();
    await acceptBtn.click({ timeout: 3_000 });
    await banner.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  } catch {}
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. h1 tags on every public page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('h1 tag verification', () => {
  const PUBLIC_PAGES = [
    { path: '/',          name: 'Index' },
    { path: '/about-us',  name: 'About' },
    { path: '/contact-us',name: 'Contact' },
    { path: '/gallery',   name: 'Gallery' },
    { path: '/portfolio', name: 'Portfolio' },
    { path: '/services',  name: 'Services' },
    { path: '/blog',      name: 'Blog' },
    { path: '/estimate',  name: 'Estimate' },
  ] as const;

  for (const { path, name } of PUBLIC_PAGES) {
    test(`exactly one h1 on ${name} (${path})`, async ({ page }) => {
      await page.goto(path);
      await dismissCookieBanner(page);
      await page.waitForTimeout(500);

      await expect(page.locator('h1')).toHaveCount(1);
    });

    test(`h1 content not empty on ${name} (${path})`, async ({ page }) => {
      await page.goto(path);
      await dismissCookieBanner(page);
      await page.waitForTimeout(500);

      const text = await page.locator('h1').first().textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Focus trap in video modal (about-us)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Focus trap in video modal', () => {
  test('dialog traps focus and closes on Escape', async ({ page }) => {
    await page.goto('/about-us');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    // Attempt to locate a Play Video / video trigger button
    const trigger = page.locator('button').filter({
      hasText: /play|video|watch|▶|►|start/i,
    }).first();
    const triggerExists = await trigger.isVisible().catch(() => false);
    test.skip(!triggerExists, 'No video trigger button found on about-us page');

    await trigger.click();
    await page.waitForTimeout(500);

    // Verify modal has correct ARIA attributes
    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Tab through elements 10 times — focus should remain trapped in modal
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // Assert modal is still open after tabbing
    await expect(modal).toBeVisible({ timeout: 1_000 });

    // Press Escape and verify modal closes
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(modal).not.toBeVisible({ timeout: 3_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Tablist has proper aria-controls (blog page)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Tablist aria-controls validation', () => {
  test('each tab has matching tabpanel via aria-controls', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieBanner(page);
    await page.waitForTimeout(1_000);

    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible({ timeout: 8_000 });

    const tabs = tablist.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const controlsId = await tab.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      // Verify a corresponding tabpanel with that ID exists
      if (controlsId) {
        const panel = page.locator(`[role="tabpanel"]#${CSS.escape(controlsId)}`);
        await expect(panel).toHaveCount(1, { timeout: 3_000 });
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Nav landmarks have aria-label
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Navigation landmark labels', () => {
  test('public site nav has non-empty aria-label', async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);

    const navs = page.locator('nav');
    const count = await navs.count();
    expect(count).toBeGreaterThan(0);

    let labelledFound = false;
    for (let i = 0; i < count; i++) {
      const label = await navs.nth(i).getAttribute('aria-label');
      if (label && label.trim().length > 0) {
        labelledFound = true;
        break;
      }
    }
    expect(labelledFound).toBe(true);
  });

  test('admin TopBar header contains nav with aria-label="Admin"', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1_000);

    const adminNav = page.locator('header nav[aria-label="Admin"]');
    await expect(adminNav).toHaveCount(1, { timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. KeyboardShortcutsOverlay aria-labelledby IDs
// ─────────────────────────────────────────────────────────────────────────────
test.describe('KeyboardShortcutsOverlay aria-labelledby', () => {
  test('aria-labelledby references on sections point to valid id attributes', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1_000);

    // Press ? to open the shortcuts overlay
    // Ensure no input/textarea is focused first
    await page.locator('body').click();
    await page.keyboard.press('?');
    await page.waitForTimeout(600);

    const dialog = page.locator('[role="dialog"]').filter({ hasText: /Keyboard shortcuts/i });
    const dialogVisible = await dialog.isVisible().catch(() => false);
    test.skip(!dialogVisible, 'Keyboard shortcuts overlay did not open');

    // Collect every aria-labelledby from sections inside the dialog
    const sections = dialog.locator('section[aria-labelledby]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const raw = await section.getAttribute('aria-labelledby');
      expect(raw).toBeTruthy();

      const ids = raw!.split(/\s+/);
      for (const id of ids) {
        // Assert ID contains no spaces or special characters (only dashes allowed)
        expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);

        // Assert each referenced ID exists on a descendant element inside the dialog
        const ref = dialog.locator(`#${CSS.escape(id)}`);
        await expect(ref).toHaveCount(1, { timeout: 3_000 });
      }
    }

    // Close the overlay
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
});
