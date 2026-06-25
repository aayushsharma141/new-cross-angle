import { test } from '@playwright/test';

test('capture media library', async ({ page }) => {
  await page.goto('http://localhost:8080/admin/cms/media-library');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Try to select an item to show the bulk actions toolbar
  try {
    // Click the first file/folder if it exists
    const fileItem = page.locator('.media-item').first(); // Wait, what's the class?
    await page.locator('text=Select All').click();
    await page.waitForTimeout(1000);
  } catch (e) {}

  await page.screenshot({ path: 'media-library-screenshot.png', fullPage: true });
});
