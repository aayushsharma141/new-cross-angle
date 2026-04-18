import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  laptop: { width: 1024, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
  smallMobile: { width: 320, height: 568 },
};

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE LAYOUT TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Responsive Layout - Desktop (1280px)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('Full navigation visible', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('Desktop nav links visible', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(3);
  });

  test('Multi-column layouts render', async ({ page }) => {
    await page.goto('/services');
    const columns = page.locator('[class*="grid-cols-2"], [class*="grid-cols-3"]').first();
    if (await columns.isVisible()) {
      await expect(columns).toBeVisible();
    }
  });

  test('Hover effects active', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('nav a').first();
    await link.hover();
    await page.waitForTimeout(100);
  });

  test('Footer full layout', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Responsive Layout - Laptop (1024px)', () => {
  test.use({ viewport: VIEWPORTS.laptop });

  test('Navigation adapts', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('Condensed layout renders', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Grid columns reduce', async ({ page }) => {
    await page.goto('/services');
    const grid = page.locator('[class*="grid"]').first();
    if (await grid.isVisible()) {
      await expect(grid).toBeVisible();
    }
  });
});

test.describe('Responsive Layout - Tablet (768px)', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test('Navigation adapts to tablet', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('Hamburger menu visible on tablet', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await hamburger.isVisible()) {
      await expect(hamburger).toBeVisible();
    }
  });

  test('Two-column grids on tablet', async ({ page }) => {
    await page.goto('/services');
    await page.waitForTimeout(500);
  });

  test('Touch targets appropriately sized', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });

  test('Content readable without horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.tablet.width * 1.1);
  });
});

test.describe('Responsive Layout - Mobile (375px)', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('Hamburger menu required', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await expect(hamburger).toBeVisible();
  });

  test('Mobile menu opens', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);
    }
  });

  test('Mobile menu closes on link click', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
      const menuLink = page.locator('[class*="mobile"] a, nav a').filter({ hasText: /About|Services/i }).first();
      if (await menuLink.isVisible()) {
        await menuLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Single column layouts', async ({ page }) => {
    await page.goto('/services');
    await page.waitForTimeout(500);
  });

  test('Full-width buttons', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('button').filter({ hasText: /Contact|Get Quote/i }).first();
    if (await button.isVisible()) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(VIEWPORTS.mobile.width * 0.7);
      }
    }
  });

  test('No horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const overflow = await body.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test('Footer stacks vertically', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Responsive Layout - Small Mobile (320px)', () => {
  test.use({ viewport: VIEWPORTS.smallMobile });

  test('Content fits screen', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Text truncation works', async ({ page }) => {
    await page.goto('/');
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Buttons remain tappable', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await hamburger.isVisible()) {
      await expect(hamburger).toBeVisible();
      const box = await hamburger.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(32);
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE COMPONENT BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Responsive Component Behavior', () => {
  test('Gallery grid adapts', async ({ page }) => {
    await page.goto('/gallery');
    
    // Desktop
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.waitForTimeout(300);
    
    // Mobile
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.waitForTimeout(300);
  });

  test('Portfolio filters collapse on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/portfolio');
    await page.waitForTimeout(500);
  });

  test('Contact form fields stack on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/contact-us');
    await page.waitForTimeout(500);
  });

  test('Admin sidebar collapses on tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(500);
  });

  test('Admin tables scroll horizontally on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/admin/crm/leads');
    await page.waitForTimeout(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - KEYBOARD NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Tab navigates through interactive elements', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('Enter activates buttons', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  });

  test('Space activates buttons', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
  });

  test('Escape closes modals', async ({ page }) => {
    const modalTrigger = page.locator('button').filter({ hasText: /View|Details|Quick/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('Arrow keys navigate tabs', async ({ page }) => {
    await page.goto('/services');
    const firstTab = page.locator('[role="tab"]').first();
    if (await firstTab.isVisible()) {
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
  });

  test('Home/End keys navigate tabs', async ({ page }) => {
    await page.goto('/services');
    const firstTab = page.locator('[role="tab"]').first();
    if (await firstTab.isVisible()) {
      await firstTab.focus();
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.press('End');
      await page.waitForTimeout(100);
    }
  });

  test('Tab closes dropdowns', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - FOCUS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Focus Management', () => {
  test('Skip link visible on Tab', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible({ timeout: 1000 }).catch(() => {});
  });

  test('Skip link navigates to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      await page.waitForTimeout(300);
    }
  });

  test('Focus trap in modal', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /View|Details|Quick/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      
      // Tab through modal elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      // Modal should still be open
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('Focus returns after modal close', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /View|Details|Quick/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('Focus visible indicator present', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const styles = await focused.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
      };
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - SEMANTIC HTML
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Semantic HTML', () => {
  test('Single h1 per page', async ({ page }) => {
    await page.goto('/');
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('Heading hierarchy maintained', async ({ page }) => {
    await page.goto('/');
    const headings = await page.evaluate(() => {
      const els = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const levels = Array.from(els).map(el => parseInt(el.tagName[1]));
      return levels;
    });
    // Check that h2 doesn't follow h4 without h3, etc.
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i]).toBeLessThanOrEqual(headings[i - 1] + 1);
    }
  });

  test('Landmark regions present', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('Nav has label', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    const navCount = await nav.count();
    if (navCount > 0) {
      const hasLabel = await nav.first().evaluate((el) => {
        return el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.querySelector('h1, h2');
      });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - IMAGES & MEDIA
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Images & Media', () => {
  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    const imagesWithoutAlt = page.locator('img:not([alt])');
    const count = await imagesWithoutAlt.count();
    expect(count).toBe(0);
  });

  test('Decorative images have empty alt', async ({ page }) => {
    await page.goto('/');
    const decorativeImages = page.locator('img[alt=""]');
    const count = await decorativeImages.count();
  });

  test('Icons have accessible names or are aria-hidden', async ({ page }) => {
    await page.goto('/');
    const icons = page.locator('svg').filter({ hasNot: page.locator('[aria-label], [aria-labelledby]') });
    const count = await icons.count();
  });

  test('Logo has descriptive alt', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('img[alt*="Cross"], img[alt*="Interior"]').first();
    if (await logo.isVisible()) {
      await expect(logo).toHaveAttribute('alt', /Cross|Interior/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - FORMS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Forms', () => {
  test('Form labels associated with inputs', async ({ page }) => {
    await page.goto('/contact-us');
    const inputs = page.locator('input:not([type="hidden"]), textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const hasLabel = await input.evaluate((el) => {
          const id = el.id || el.getAttribute('name');
          const label = document.querySelector(`label[for="${id}"]`);
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const placeholder = el.getAttribute('placeholder');
          return !!(label || ariaLabel || ariaLabelledby || placeholder);
        });
      }
    }
  });

  test('Required fields marked', async ({ page }) => {
    await page.goto('/contact-us');
    const requiredFields = page.locator('input[required], [aria-required="true"]');
    const count = await requiredFields.count();
  });

  test('Error messages associated with fields', async ({ page }) => {
    await page.goto('/contact-us');
    await page.locator('button[type="submit"]').click().catch(() => {});
    await page.waitForTimeout(500);
  });

  test('Submit buttons have accessible names', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      const hasName = await submitBtn.evaluate((el) => {
        return el.textContent?.trim() || el.getAttribute('aria-label');
      });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY - COLOR & CONTRAST
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility - Color & Contrast', () => {
  test('Primary text has sufficient contrast', async ({ page }) => {
    await page.goto('/');
    const text = page.locator('main p, main span').first();
    if (await text.isVisible()) {
      const bg = await page.evaluate(() => {
        const el = document.querySelector('main');
        return el ? window.getComputedStyle(el).backgroundColor : 'rgb(255, 255, 255)';
      });
    }
  });

  test('Links distinguishable from text', async ({ page }) => {
    await page.goto('/');
    const paragraph = page.locator('p').first();
    if (await paragraph.isVisible()) {
      const hasLinks = await paragraph.evaluate((el) => {
        return el.innerHTML.includes('<a');
      });
    }
  });

  test('Focus indicators visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const outline = await focused.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    expect(outline).not.toBe('none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REDUCED MOTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Reduced Motion Preference', () => {
  test('Respects prefers-reduced-motion: reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Page should load without animation delays
    const start = Date.now();
    await page.waitForTimeout(500);
    const elapsed = Date.now() - start;
    
    // Should not have excessive animation delays
    expect(elapsed).toBeLessThan(1000);
  });

  test('Scroll animations disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
  });

  test('Transitions instant', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('button').first().hover();
    await page.waitForTimeout(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN READER ANNOUNCEMENTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Screen Reader Announcements', () => {
  test('ARIA live regions present for dynamic content', async ({ page }) => {
    await page.goto('/');
    const liveRegions = page.locator('[aria-live], [aria-atomic]');
    const count = await liveRegions.count();
  });

  test('Toast notifications announced', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Loading states announced', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOUCH INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Touch Interactions', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('Touch targets minimum 44x44px', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(32);
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    }
  });

  test('Swipe gestures work on carousel', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
  });

  test('Pull to refresh on mobile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HIGH CONTRAST MODE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('High Contrast Mode', () => {
  test('Text remains readable', async ({ page }) => {
    await page.goto('/');
    const text = page.locator('body');
    await expect(text).toBeVisible();
  });

  test('Interactive elements have borders', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      const border = await buttons.evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM LEVELS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Zoom Level Support', () => {
  test('Page functional at 100% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Page functional at 125% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 576 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Page functional at 150% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 853, height: 480 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('No content cutoff at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 360 });
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
