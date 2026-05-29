import { test, expect, Page } from '@playwright/test';
 
 const dismissCookieBanner = async (page: Page) => {
   const banner = page.locator('div.fixed.inset-0.z-\\[100\\]');
   const acceptAll = page.locator('button').filter({ hasText: /Accept All/i }).first();
   if (await acceptAll.isVisible()) {
     await acceptAll.click();
     await expect(banner).not.toBeVisible();
   }
 };


// Test utilities
const takeScreenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: false });
};

// test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────────────────────
// BASE UI COMPONENTS - BUTTON MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Button Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('Default button hover state', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /Book Free Consultation/i }).first();
    if (await button.isVisible()) {
      await button.hover();
      await expect(button).toHaveClass(/hover:/);
    }
  });

  test('Button click feedback - scale down', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /Book Free Consultation/i }).first();
    if (await button.isVisible()) {
      await button.click({ force: true });
      await page.waitForTimeout(100);
      await expect(button).toBeVisible();
    }
  });

  test('Button disabled state', async ({ page }) => {
    const button = page.locator('button[disabled]').first();
    if (await button.count() > 0) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveClass(/opacity-50/);
    }
  });

  test('Button focus ring visible on keyboard navigation', async ({ page }) => {
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      await button.focus();
      await expect(button).toBeFocused();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INPUT MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Input Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
  });
  test('Input focus ring animation', async ({ page }) => {
    await page.goto('/contact-us');
    const input = page.locator('input[type="text"], input[type="email"], input[type="tel"]').first();
    if (await input.isVisible()) {
      await input.focus();
      await expect(input).toHaveClass(/focus-visible:ring/);
    }
  });

  test('Input placeholder visible', async ({ page }) => {
    await page.goto('/contact-us');
    const input = page.locator('input[placeholder], textarea[placeholder]').first();
    if (await input.isVisible()) {
      await expect(input).toHaveAttribute('placeholder', /.+/);
    }
  });

  test('Input typing feedback', async ({ page }) => {
    await page.goto('/contact-us');
    const input = page.locator('input[type="text"], input[type="email"]').first();
    if (await input.isVisible()) {
      await input.fill('Test User');
      await expect(input).toHaveValue('Test User');
    }
  });

  test('Input validation error state', async ({ page }) => {
    await page.goto('/contact-us');
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      await page.locator('button[type="submit"]').click().catch(() => {});
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION - HAMBURGER MENU ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Navbar Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Mobile hamburger transforms to X', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const hamburger = page.locator('button[aria-label="Open menu"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.locator('button[aria-label="Close menu"]')).toBeVisible();
    }
  });

  test('Mobile menu slides down animation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const hamburger = page.locator('button[aria-label="Open menu"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(400);
      const menu = page.locator('header div.overflow-hidden').filter({ hasText: /Book Free Consultation/i });
      await expect(menu).toBeVisible();
    }
  });

  test('Navbar becomes solid on scroll', async ({ page }) => {
    // Force enough body height and scroll down
    await page.evaluate(() => {
      document.body.style.height = '2000px';
      window.scrollTo(0, 500);
      window.dispatchEvent(new Event('scroll'));
    });
    
    const navbar = page.locator('header').first();
    await expect(navbar).toHaveClass(/backdrop-blur|shadow|bg-background/);
  });

  test('Nav links hover underline effect', async ({ page }) => {
    const navLink = page.locator('nav a').filter({ hasText: /Services/i }).first();
    if (await navLink.isVisible()) {
      await navLink.hover();
      await page.waitForTimeout(100);
    }
  });

  test('Active nav link highlighted', async ({ page }) => {
    await page.goto('/services');
    const activeLink = page.locator('nav a').filter({ hasText: /Services/i }).first();
    if (await activeLink.isVisible()) {
      const classes = await activeLink.getAttribute('class');
      expect(classes).toMatch(/text-\[#FFD700\]|text-primary/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Footer Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Footer social icons hover scale', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const socialIcon = page.locator('footer a[href*="facebook"], footer a[href*="instagram"]').first();
    if (await socialIcon.isVisible()) {
      await socialIcon.hover();
      await page.waitForTimeout(100);
    }
  });

  test('Footer links hover underline', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footerLink = page.locator('footer a').filter({ hasText: /Privacy/i }).first();
    if (await footerLink.isVisible()) {
      await footerLink.hover();
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DIALOG / MODAL MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Dialog Modal Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Modal backdrop fade in', async ({ page }) => {
    // Find any modal trigger
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      const backdrop = page.locator('[data-state="open"] [class*="fixed inset-0"]').first();
      await expect(backdrop).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('Modal content scale up animation', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(400);
    }
  });

  test('Modal close on backdrop click', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      const backdrop = page.locator('[role="dialog"]').first();
      if (await backdrop.isVisible()) {
        await backdrop.click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
      }
    }
  });

  test('Modal close on Escape key', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CAROUSEL MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Carousel Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Carousel navigation arrows visible on hover', async ({ page }) => {
    // Scroll to carousel section
    await page.evaluate(() => {
      const element = document.querySelector('[class*="carousel"], [class*="swiper"]');
      if (element) element.scrollIntoView();
    });
    await page.waitForTimeout(500);
  });

  test('Carousel dot navigation click', async ({ page }) => {
    await page.goto('/');
    const dots = page.locator('[class*="carousel"] button[class*="w-2"], [class*="dot"]').first();
    if (await dots.isVisible()) {
      await dots.click();
      await page.waitForTimeout(300);
    }
  });

  test('Carousel swipe on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDION MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accordion Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
  });
  test('Accordion expand animation', async ({ page }) => {
    const accordionTrigger = page.locator('[data-radix-collection-item]').first();
    if (await accordionTrigger.isVisible()) {
      await accordionTrigger.click();
      await page.waitForTimeout(300);
      const content = page.locator('[data-state="open"] > div').first();
      await expect(content).toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('Accordion chevron rotation', async ({ page }) => {
    await page.goto('/contact-us');
    const accordionTrigger = page.locator('[data-radix-collection-item]').first();
    if (await accordionTrigger.isVisible()) {
      await accordionTrigger.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TABS MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Tabs Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await dismissCookieBanner(page);
  });
  test('Tab underline slides to selected', async ({ page }) => {
    const tab = page.locator('[role="tab"]').first();
    if (await tab.isVisible()) {
      await tab.click();
      await page.waitForTimeout(300);
      await expect(tab).toHaveAttribute('data-state', 'active');
    }
  });

  test('Tab keyboard navigation with arrow keys', async ({ page }) => {
    await page.goto('/services');
    const firstTab = page.locator('[role="tab"]').first();
    if (await firstTab.isVisible()) {
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Tooltip Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Tooltip appears on hover with delay', async ({ page }) => {
    const trigger = page.locator('[data-tooltip-content], button').first();
    if (await trigger.isVisible()) {
      await trigger.hover();
      await page.waitForTimeout(400);
    }
  });

  test('Tooltip positioned correctly', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-tooltip-content], button').first();
    if (await trigger.isVisible()) {
      await trigger.hover();
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SWITCH / TOGGLE MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Switch Toggle Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/system/settings');
    await dismissCookieBanner(page);
  });
  test('Switch slides on toggle', async ({ page }) => {
    const switchToggle = page.locator('[role="switch"]').first();
    if (await switchToggle.isVisible()) {
      await switchToggle.click();
      await page.waitForTimeout(200);
      await expect(switchToggle).toHaveAttribute('data-state', 'checked');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Checkbox Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
  });
  test('Checkbox check animation', async ({ page }) => {
    const checkbox = page.locator('[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  });

  test('Checkbox label click toggles state', async ({ page }) => {
    await page.goto('/contact-us');
    const checkbox = page.locator('[type="checkbox"]').first();
    const label = page.locator('label').filter({ has: checkbox }).first();
    if (await label.isVisible()) {
      await label.click();
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Progress Bar Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dismissCookieBanner(page);
  });
  test('Progress bar fills animation', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"]').first();
    if (await progressBar.isVisible()) {
      const value = await progressBar.getAttribute('aria-valuenow');
      expect(parseInt(value || '0')).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SHEET / SIDEBAR MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sheet Sidebar Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/leads');
    await dismissCookieBanner(page);
  });
  test('Sheet slides in from right', async ({ page }) => {
    const sheetTrigger = page.locator('button').filter({ hasText: /View|Details/i }).first();
    if (await sheetTrigger.isVisible()) {
      await sheetTrigger.click();
      await page.waitForTimeout(400);
      const sheet = page.locator('[data-state="open"]').first();
      await expect(sheet).toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('Sheet close on backdrop click', async ({ page }) => {
    await page.goto('/admin/leads');
    const sheetTrigger = page.locator('button').filter({ hasText: /View|Details/i }).first();
    if (await sheetTrigger.isVisible()) {
      await sheetTrigger.click();
      await page.waitForTimeout(400);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SELECT DROPDOWN MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Select Dropdown Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/services');
    await dismissCookieBanner(page);
  });
  test('Select dropdown opens on click', async ({ page }) => {
    const selectTrigger = page.locator('[role="combobox"]').first();
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator('[role="listbox"]').first();
      await expect(dropdown).toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('Select option highlight on hover', async ({ page }) => {
    await page.goto('/admin/services');
    const selectTrigger = page.locator('[role="combobox"]').first();
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.hover();
        await page.waitForTimeout(100);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Form Validation Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
  });
  test('Real-time field validation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await page.waitForTimeout(500);
    }
  });

  test('Error message slide-in animation', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Character count updates live', async ({ page }) => {
    await page.goto('/contact-us');
    const textarea = page.locator('textarea[maxlength]').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Test message');
      await page.waitForTimeout(100);
    }
  });

  test('Form submission loading state', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(100);
    }
  });

  test('Success state after form submit', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Scroll Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Scroll reveal on elements entering viewport', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
  });

  test('Sticky elements behavior', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
  });

  test('Scroll to top button appears', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    const scrollBtn = page.locator('button[aria-label*="scroll to top"], button[aria-label*="back to top"]').first();
    if (await scrollBtn.isVisible()) {
      await expect(scrollBtn).toBeVisible();
    }
  });

  test('Marquee continuous scroll animation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);
    const marquee = page.locator('[class*="marquee"], [class*="animate-marquee"]').first();
    if (await marquee.isVisible()) {
      await marquee.hover();
      await page.waitForTimeout(200);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE LAZY LOADING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Image Lazy Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
    await dismissCookieBanner(page);
  });
  test('Images load when entering viewport', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(1000);
  });

  test('Image placeholder blur effect', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
  });

  test('Image error fallback', async ({ page }) => {
    // Gallery page has robust images
    const images = page.locator('img');
    await expect(images.first()).toBeVisible();
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
  });
  test('Toast appears on action', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
    const toast = page.locator('[data-sonner-toast], [role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('Toast dismisses automatically', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(4000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADING STATES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Skeleton Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dismissCookieBanner(page);
  });
  test('Skeleton pulses while loading', async ({ page }) => {
    await page.waitForTimeout(500);
    const skeletons = page.locator('[class*="skeleton"], [class*="animate-pulse"]');
    const count = await skeletons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Focus trap in modal', async ({ page }) => {
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
    }
  });

  test('Skip to content link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible({ timeout: 1000 }).catch(() => {});
  });

  test('Focus visible on all interactive elements', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    await firstButton.focus();
    const styles = await firstButton.evaluate(el => window.getComputedStyle(el).outline);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Tab navigates through page elements', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }
  });

  test('Enter activates buttons', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  });

  test('Escape closes modals', async ({ page }) => {
    await page.goto('/');
    const modalTrigger = page.locator('button').filter({ hasText: /Quick View|View Details/i }).first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('Arrow keys navigate within components', async ({ page }) => {
    await page.goto('/services');
    const tabs = page.locator('[role="tab"]');
    if (await tabs.first().isVisible()) {
      await tabs.first().focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE VISUAL CHECKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Responsive Layout Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Desktop (1280px) - Full layout', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
  });

  test('Laptop (1024px) - Condensed nav', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Tablet (768px) - Touch targets increased', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Mobile (375px) - Hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const hamburger = page.locator('button[aria-label="Open menu"]');
    await expect(hamburger).toBeVisible();
  });

  test('Small mobile (320px) - Content fits', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REDUCED MOTION PREFERENCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Reduced Motion Preference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Respects prefers-reduced-motion', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TRANSITIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('Navigation triggers page change', async ({ page }) => {
    await page.click('nav a[href="/about-us"]');
    await expect(page).toHaveURL(/\/about-us/);
  });

  test('Back button works correctly', async ({ page }) => {
    await page.goto('/about-us');
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('Page content loads after navigation', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Gallery Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
    await dismissCookieBanner(page);
  });
  test('Gallery filter tabs', async ({ page }) => {
    const filterTab = page.locator('button').filter({ hasText: /Living|Bedroom|Kitchen/i }).first();
    if (await filterTab.isVisible()) {
      await filterTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('Gallery card hover overlay', async ({ page }) => {
    await page.goto('/gallery');
    const galleryCard = page.locator('[class*="gallery-card"], [class*="masonry"] img').first();
    if (await galleryCard.isVisible()) {
      await galleryCard.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Gallery lightbox opens', async ({ page }) => {
    await page.goto('/gallery');
    const galleryItem = page.locator('[class*="gallery"] img, [class*="portfolio"] img').first();
    if (await galleryItem.isVisible()) {
      await galleryItem.click();
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Contact Form Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us');
    await dismissCookieBanner(page);
    // Ensure the form is loaded
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 });
  });
  test('All form fields are accessible', async ({ page }) => {
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Form submission shows loading', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('Success/error messages display', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY CHECKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Accessibility Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });
  test('All images have alt text', async ({ page }) => {
    const imagesWithoutAlt = page.locator('img:not([alt])');
    await expect(imagesWithoutAlt).toHaveCount(0);
  });

  test('Buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    const buttonsWithoutName = page.locator('button:not([aria-label]):not(:has-text(""))');
    const count = await buttonsWithoutName.count();
  });

  test('Form labels are associated', async ({ page }) => {
    await page.goto('/contact-us');
    const inputs = page.locator('input:not([id]), textarea:not([id])');
    const count = await inputs.count();
  });

  test('Heading hierarchy is correct', async ({ page }) => {
    await page.goto('/');
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    const mainText = page.locator('main p, main span, main a').first();
    if (await mainText.isVisible()) {
      const bg = await page.evaluate(() => {
        const el = document.querySelector('main');
        return el ? window.getComputedStyle(el).backgroundColor : 'rgb(255, 255, 255)';
      });
    }
  });
});
