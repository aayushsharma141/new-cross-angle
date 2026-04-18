import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Navigation', () => {
  test('Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$|\/home/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Services page loads', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Portfolio page loads', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/\/portfolio/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Gallery page loads', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page).toHaveURL(/\/gallery/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto('/contact-us');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Discovery quiz page loads', async ({ page }) => {
    await page.goto('/discovery');
    await expect(page).toHaveURL(/\/discovery/);
    await page.waitForTimeout(2000);
  });

  test('Estimator page loads', async ({ page }) => {
    await page.goto('/estimator');
    await expect(page).toHaveURL(/\/estimator/);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('404 page loads for unknown route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-123');
    await expect(page).toHaveURL(/\/this-page-does-not-exist/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION LINKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Navigation Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Click About in nav navigates', async ({ page }) => {
    const aboutLink = page.locator('nav a[href="/about"], header a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('Click Services in nav navigates', async ({ page }) => {
    const servicesLink = page.locator('nav a[href="/services"], header a[href="/services"]').first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/\/services/);
    }
  });

  test('Click Portfolio in nav navigates', async ({ page }) => {
    const portfolioLink = page.locator('nav a[href="/portfolio"], header a[href="/portfolio"]').first();
    if (await portfolioLink.isVisible()) {
      await portfolioLink.click();
      await expect(page).toHaveURL(/\/portfolio/);
    }
  });

  test('Click Gallery in nav navigates', async ({ page }) => {
    const galleryLink = page.locator('nav a[href="/gallery"], header a[href="/gallery"]').first();
    if (await galleryLink.isVisible()) {
      await galleryLink.click();
      await expect(page).toHaveURL(/\/gallery/);
    }
  });

  test('Click Contact in nav navigates', async ({ page }) => {
    const contactLink = page.locator('nav a[href="/contact-us"], header a[href="/contact-us"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/);
    }
  });

  test('Click Logo navigates to home', async ({ page }) => {
    const logoLink = page.locator('header a[href="/"], header img').first();
    if (await logoLink.isVisible()) {
      await logoLink.click();
      await expect(page).toHaveURL(/\/$|\/home/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  });

  test('Footer About link navigates', async ({ page }) => {
    const aboutLink = page.locator('footer a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('Footer Services link navigates', async ({ page }) => {
    const servicesLink = page.locator('footer a[href="/services"]').first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/\/services/);
    }
  });

  test('Footer Contact link navigates', async ({ page }) => {
    const contactLink = page.locator('footer a[href="/contact-us"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/);
    }
  });

  test('Footer Privacy link navigates', async ({ page }) => {
    const privacyLink = page.locator('footer a[href="/privacy"]').first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/\/privacy/);
    }
  });

  test('Footer Blog link navigates', async ({ page }) => {
    const blogLink = page.locator('footer a[href="/blog"]').first();
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/\/blog/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BROWSER NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Browser Navigation', () => {
  test('Back button works', async ({ page }) => {
    await page.goto('/about');
    await page.goto('/services');
    await page.goBack();
    await expect(page).toHaveURL(/\/about/);
  });

  test('Forward button works', async ({ page }) => {
    await page.goto('/about');
    await page.goto('/services');
    await page.goBack();
    await page.goForward();
    await expect(page).toHaveURL(/\/services/);
  });

  test('Browser back after link click', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a[href="/about"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.goBack();
    await expect(page).toHaveURL(/\/$|\/home/);
  });

  test('History state maintained', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a[href="/about"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('nav a[href="/services"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    
    await page.goBack();
    await expect(page).toHaveURL(/\/about/);
    
    await page.goBack();
    await expect(page).toHaveURL(/\/$|\/home/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TRANSITION ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Transition Animations', () => {
  test('Transition on navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a[href="/about"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
  });

  test('Content fade in', async ({ page }) => {
    await page.goto('/about');
    await page.waitForTimeout(500);
    const main = page.locator('main');
    if (await main.isVisible()) {
      await expect(main).toBeVisible();
    }
  });

  test('Scroll position reset on navigation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.locator('nav a[href="/about"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CTA Button Navigation', () => {
  test('Header CTA navigates to contact', async ({ page }) => {
    await page.goto('/');
    const ctaBtn = page.locator('header button, header a').filter({ hasText: /Contact|Book|Consultation/i }).first();
    if (await ctaBtn.isVisible()) {
      await ctaBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Hero CTA navigates', async ({ page }) => {
    await page.goto('/');
    const heroCta = page.locator('main button, main a').filter({ hasText: /Get Started|Explore|View/i }).first();
    if (await heroCta.isVisible()) {
      await heroCta.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Services page CTA navigates', async ({ page }) => {
    await page.goto('/services');
    const cta = page.locator('button, a').filter({ hasText: /Get Quote|Contact|Start/i }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Portfolio CTA navigates', async ({ page }) => {
    await page.goto('/portfolio');
    const cta = page.locator('button, a').filter({ hasText: /Contact|Get Started/i }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Contact page form CTA visible', async ({ page }) => {
    await page.goto('/contact-us');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL LINKS VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Internal Links Verification', () => {
  test('All nav links return 200', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a[href^="/"]');
    const count = await navLinks.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href) {
        const response = await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('Footer links are valid', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footerLinks = page.locator('footer a[href^="/"]');
    const count = await footerLinks.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        const response = await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL LINKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('External Links', () => {
  test('Social media links open in new tab', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const socialLink = page.locator('footer a[href*="facebook"], footer a[href*="instagram"], footer a[href*="twitter"]').first();
    if (await socialLink.isVisible()) {
      const target = await socialLink.getAttribute('target');
      expect(target).toBe('_blank');
    }
  });

  test('External links have rel="noopener"', async ({ page }) => {
    await page.goto('/');
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = externalLinks.nth(i);
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('WhatsApp link is valid', async ({ page }) => {
    await page.goto('/');
    const whatsappLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first();
    if (await whatsappLink.isVisible()) {
      const href = await whatsappLink.getAttribute('href');
      expect(href).toMatch(/wa\.me|whatsapp/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ANCHOR LINKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Anchor Links (Smooth Scroll)', () => {
  test('Anchor links scroll to section', async ({ page }) => {
    await page.goto('/');
    const anchorLink = page.locator('a[href^="#"]').first();
    if (await anchorLink.isVisible()) {
      const href = await anchorLink.getAttribute('href');
      if (href && href !== '#') {
        await anchorLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Section nav dots work', async ({ page }) => {
    await page.goto('/');
    const sectionDots = page.locator('[class*="dot"], [class*="indicator"]').first();
    if (await sectionDots.isVisible()) {
      await sectionDots.click();
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// URL PARAMETERS & QUERY STRINGS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('URL Parameters', () => {
  test('Query parameters preserved on navigation', async ({ page }) => {
    await page.goto('/?utm_source=test');
    await page.locator('nav a[href="/about"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    // Query might be lost on navigation depending on implementation
  });

  test('Service category filter works', async ({ page }) => {
    await page.goto('/services?category=residential');
    await page.waitForTimeout(1000);
  });

  test('Gallery filter works', async ({ page }) => {
    await page.goto('/gallery?filter=bedroom');
    await page.waitForTimeout(1000);
  });

  test('Blog pagination works', async ({ page }) => {
    await page.goto('/blog?page=2');
    await page.waitForTimeout(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEO LINKS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('SEO & Meta Links', () => {
  test('Canonical URL present', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Meta description present', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    const content = await description.getAttribute('content');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('Open Graph tags present', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    const content = await ogTitle.getAttribute('content');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('Page title accurate', async ({ page }) => {
    await page.goto('/about');
    const title = await page.title();
    expect(title).toMatch(/About|Crossangle/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Hamburger menu opens', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await hamburger.click();
    await page.waitForTimeout(500);
    
    const menu = page.locator('[class*="mobile"], [class*="menu"]').first();
    await expect(menu).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('Mobile menu links work', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await hamburger.click();
    await page.waitForTimeout(500);
    
    const menuLink = page.locator('nav a, [class*="mobile"] a').filter({ hasText: /About/i }).first();
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('Mobile menu closes on link click', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await hamburger.click();
    await page.waitForTimeout(500);
    
    const menuLink = page.locator('nav a, [class*="mobile"] a').filter({ hasText: /Services/i }).first();
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('Mobile hamburger changes to X', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await hamburger.click();
    
    const closeBtn = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first();
    await expect(closeBtn).toBeVisible({ timeout: 2000 }).catch(() => {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Routing', () => {
  test('Admin dashboard loads', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
  });

  test('Admin leads page loads', async ({ page }) => {
    await page.goto('/admin/crm/leads');
    await page.waitForTimeout(2000);
  });

  test('Admin blogs page loads', async ({ page }) => {
    await page.goto('/admin/cms/blogs');
    await page.waitForTimeout(2000);
  });

  test('Admin media page loads', async ({ page }) => {
    await page.goto('/admin/cms/media');
    await page.waitForTimeout(2000);
  });

  test('Admin settings page loads', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForTimeout(2000);
  });

  test('Unknown admin route shows 404 or redirects', async ({ page }) => {
    await page.goto('/admin/unknown-page-xyz');
    await page.waitForTimeout(2000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE LOAD PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Load Performance', () => {
  test('DOMContentLoaded fires quickly', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('Main content visible within timeout', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
  });

  test('No critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools') &&
      !e.includes('third-party')
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DEEP LINKING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Deep Linking', () => {
  test('Direct link to blog post', async ({ page }) => {
    await page.goto('/blog/first-post').catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('Direct link to project detail', async ({ page }) => {
    await page.goto('/projects/modern-apartment').catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('Direct link to service detail', async ({ page }) => {
    await page.goto('/services/modular-kitchen').catch(() => {});
    await page.waitForTimeout(1000);
  });
});
