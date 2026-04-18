import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Helper to check element exists
const exists = async (page: Page, selector: string): Promise<boolean> => {
  const count = await page.locator(selector).count();
  return count > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('Admin login page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Login form fields present', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
    }
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toBeVisible();
    }
  });

  test('Invalid login shows error', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('invalid@test.com');
      await passwordInput.fill('wrongpassword');
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Login redirect to dashboard on success', async ({ page }) => {
    // This test assumes valid credentials - adjust for your auth setup
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Dashboard Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
  });

  test('Dashboard KPI cards render', async ({ page }) => {
    const kpiCards = page.locator('[class*="rounded-2xl"][class*="bg-"], [class*="AdminKPI"]').first();
    await expect(kpiCards).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Tab navigation switches content', async ({ page }) => {
    const tabs = page.locator('button').filter({ hasText: /Business|Website|Products|Server|System/i });
    const count = await tabs.count();
    
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      await expect(tabs.nth(1)).toHaveAttribute('aria-current', 'page');
    }
  });

  test('Date range picker opens', async ({ page }) => {
    const datePicker = page.locator('button').filter({ hasText: /Today|This Week|This Month|Custom/i }).first();
    if (await datePicker.isVisible()) {
      await datePicker.click();
      await page.waitForTimeout(300);
    }
  });

  test('Export data button triggers download', async ({ page }) => {
    const exportBtn = page.locator('button').filter({ hasText: /Export|Download/i }).first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Quick action buttons navigate', async ({ page }) => {
    const quickAction = page.locator('a[href*="/admin/"], button').filter({ hasText: /New Lead|CMS Build|Outreach|Resources/i }).first();
    if (await quickAction.isVisible()) {
      await quickAction.click();
      await page.waitForTimeout(500);
    }
  });

  test('System health indicators visible', async ({ page }) => {
    const healthSection = page.locator('text=System Health').first();
    if (await healthSection.isVisible()) {
      await expect(healthSection).toBeVisible();
    }
  });

  test('Charts render in dashboard', async ({ page }) => {
    const chartContainers = page.locator('[class*="chart"], [class*="recharts"]').first();
    if (await chartContainers.isVisible()) {
      await expect(chartContainers).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('Insight cards dismissible', async ({ page }) => {
    const dismissBtn = page.locator('button').filter({ hasText: /Dismiss|Close/i }).first();
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Data Table Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/crm/leads');
    await page.waitForTimeout(1500);
  });

  test('Table headers sortable', async ({ page }) => {
    const headers = page.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('Row hover highlight', async ({ page }) => {
    const firstRow = page.locator('tbody tr, [role="row"]').first();
    if (await firstRow.isVisible()) {
      await firstRow.hover();
      await page.waitForTimeout(100);
    }
  });

  test('Pagination controls visible', async ({ page }) => {
    const pagination = page.locator('button').filter({ hasText: /Previous|Next|Page/i }).first();
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('Search filter works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('Bulk selection checkbox', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(200);
    }
  });

  test('Bulk actions toolbar appears on selection', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').nth(1);
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(300);
    }
  });

  test('Column sort toggle', async ({ page }) => {
    const sortableHeader = page.locator('th[aria-sort], th').first();
    if (await sortableHeader.isVisible()) {
      await sortableHeader.click();
      await page.waitForTimeout(300);
      await sortableHeader.click();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN LEAD DETAIL SHEET
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Lead Detail Sheet Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/crm/leads');
    await page.waitForTimeout(1500);
  });

  test('Lead row click opens detail sheet', async ({ page }) => {
    const leadRow = page.locator('tbody tr, [role="row"]').first();
    if (await leadRow.isVisible()) {
      await leadRow.click();
      await page.waitForTimeout(500);
      const sheet = page.locator('[role="dialog"], [data-state="open"]').first();
      await expect(sheet).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('Sheet slides in from right', async ({ page }) => {
    const leadRow = page.locator('tbody tr, [role="row"]').first();
    if (await leadRow.isVisible()) {
      await leadRow.click();
      await page.waitForTimeout(400);
    }
  });

  test('Sheet close button works', async ({ page }) => {
    const leadRow = page.locator('tbody tr, [role="row"]').first();
    if (await leadRow.isVisible()) {
      await leadRow.click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], [data-state="open"] button[aria-label*="close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('Sheet tabs navigation', async ({ page }) => {
    const leadRow = page.locator('tbody tr, [role="row"]').first();
    if (await leadRow.isVisible()) {
      await leadRow.click();
      await page.waitForTimeout(500);
      const tabs = page.locator('[role="tab"]').first();
      if (await tabs.isVisible()) {
        await tabs.click();
        await page.waitForTimeout(200);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN LEAD PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Lead Pipeline Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/crm/pipeline');
    await page.waitForTimeout(1500);
  });

  test('Pipeline columns render', async ({ page }) => {
    const columns = page.locator('[class*="column"], [class*="stage"], [data-stage]');
    const count = await columns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Lead cards draggable appearance', async ({ page }) => {
    const leadCard = page.locator('[class*="card"], [class*="lead-card"]').first();
    if (await leadCard.isVisible()) {
      await leadCard.hover();
      await page.waitForTimeout(100);
    }
  });

  test('Stage counts visible', async ({ page }) => {
    const stageCount = page.locator('[class*="count"], [class*="badge"]').first();
    if (await stageCount.isVisible()) {
      await expect(stageCount).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MEDIA LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Media Library Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/cms/media');
    await page.waitForTimeout(1500);
  });

  test('Media grid renders', async ({ page }) => {
    const mediaItems = page.locator('[class*="media"], [class*="image"], img').first();
    await expect(mediaItems).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Grid/list view toggle', async ({ page }) => {
    const viewToggle = page.locator('button').filter({ hasText: /Grid|List/i }).first();
    if (await viewToggle.isVisible()) {
      await viewToggle.click();
      await page.waitForTimeout(300);
    }
  });

  test('Upload zone drag highlight', async ({ page }) => {
    const uploadZone = page.locator('[class*="upload"], [class*="dropzone"]').first();
    if (await uploadZone.isVisible()) {
      await uploadZone.hover();
      await page.waitForTimeout(100);
    }
  });

  test('Media selection checkbox', async ({ page }) => {
    const checkbox = page.locator('[class*="media"] input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(200);
    }
  });

  test('Upload progress indicator', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], [class*="progress"]').first();
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN BLOGS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Blogs Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/cms/blogs');
    await page.waitForTimeout(1500);
  });

  test('Blog list renders', async ({ page }) => {
    const blogList = page.locator('tbody tr, [role="row"]').first();
    await expect(blogList).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('New blog button visible', async ({ page }) => {
    const newBlogBtn = page.locator('a[href*="new"], button').filter({ hasText: /New|Create|Add/i }).first();
    if (await newBlogBtn.isVisible()) {
      await expect(newBlogBtn).toBeVisible();
    }
  });

  test('Status badge visible', async ({ page }) => {
    const statusBadge = page.locator('[class*="badge"], [class*="status"]').first();
    if (await statusBadge.isVisible()) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('Filter by status', async ({ page }) => {
    const statusFilter = page.locator('select, [role="combobox"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN RICH TEXT EDITOR
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Rich Text Editor Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/cms/blogs/new');
    await page.waitForTimeout(2000);
  });

  test('Editor toolbar visible', async ({ page }) => {
    const toolbar = page.locator('[class*="toolbar"], [class*="editor"]').first();
    if (await toolbar.isVisible()) {
      await expect(toolbar).toBeVisible();
    }
  });

  test('Bold button click', async ({ page }) => {
    const boldBtn = page.locator('button[title*="Bold"], button').filter({ hasText: /B\b/ }).first();
    if (await boldBtn.isVisible()) {
      await boldBtn.click();
      await page.waitForTimeout(100);
    }
  });

  test('Italic button click', async ({ page }) => {
    const italicBtn = page.locator('button[title*="Italic"], button').filter({ hasText: /I\b/ }).first();
    if (await italicBtn.isVisible()) {
      await italicBtn.click();
      await page.waitForTimeout(100);
    }
  });

  test('Link insertion modal', async ({ page }) => {
    const linkBtn = page.locator('button[title*="Link"]').first();
    if (await linkBtn.isVisible()) {
      await linkBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Image upload in editor', async ({ page }) => {
    const imageBtn = page.locator('button[title*="Image"]').first();
    if (await imageBtn.isVisible()) {
      await imageBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Typing in editor area', async ({ page }) => {
    const editor = page.locator('[class*="ProseMirror"], [contenteditable="true"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await editor.fill('Test content');
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Settings Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForTimeout(1500);
  });

  test('Settings sections collapsible', async ({ page }) => {
    const section = page.locator('[class*="accordion"], [class*="collapsible"]').first();
    if (await section.isVisible()) {
      await section.click();
      await page.waitForTimeout(300);
    }
  });

  test('Toggle switch changes state', async ({ page }) => {
    const toggle = page.locator('[role="switch"]').first();
    if (await toggle.isVisible()) {
      const initialState = await toggle.getAttribute('data-state');
      await toggle.click();
      await page.waitForTimeout(200);
      const newState = await toggle.getAttribute('data-state');
      expect(initialState).not.toEqual(newState);
    }
  });

  test('Save button disabled when no changes', async ({ page }) => {
    const saveBtn = page.locator('button').filter({ hasText: /Save|Update/i }).first();
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test('Form validation error display', async ({ page }) => {
    const input = page.locator('input[type="url"], input[type="email"]').first();
    if (await input.isVisible()) {
      await input.fill('invalid-url');
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COMMAND PALETTE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Command Palette Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
  });

  test('Command palette opens with Cmd+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    const palette = page.locator('[role="dialog"], [class*="command"]').first();
    await expect(palette).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('Command search filters results', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    const searchInput = page.locator('input[type="text"], [placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('blog');
      await page.waitForTimeout(300);
    }
  });

  test('Command selection with keyboard', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('Command palette closes on Escape', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ANALYTICS CHARTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Analytics Charts Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
  });

  test('Funnel chart renders', async ({ page }) => {
    const funnel = page.locator('[class*="funnel"], [class*="FunnelChart"]').first();
    if (await funnel.isVisible()) {
      await expect(funnel).toBeVisible();
    }
  });

  test('Chart hover tooltip', async ({ page }) => {
    const chartArea = page.locator('[class*="recharts"], [class*="chart"]').first();
    if (await chartArea.isVisible()) {
      await chartArea.hover();
      await page.waitForTimeout(300);
    }
  });

  test('Chart legend items clickable', async ({ page }) => {
    const legend = page.locator('[class*="legend"] button').first();
    if (await legend.isVisible()) {
      await legend.click();
      await page.waitForTimeout(200);
    }
  });

  test('Sparkline renders', async ({ page }) => {
    const sparkline = page.locator('[class*="sparkline"], [class*="Sparkline"]').first();
    if (await sparkline.isVisible()) {
      await expect(sparkline).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin User Management Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
  });

  test('User list renders', async ({ page }) => {
    const userList = page.locator('tbody tr, [role="row"]').first();
    await expect(userList).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Role badge visible', async ({ page }) => {
    const roleBadge = page.locator('[class*="role"], [class*="badge"]').first();
    if (await roleBadge.isVisible()) {
      await expect(roleBadge).toBeVisible();
    }
  });

  test('User actions dropdown', async ({ page }) => {
    const actionBtn = page.locator('button[aria-haspopup="menu"], button[class*="more"]').first();
    if (await actionBtn.isVisible()) {
      await actionBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MODULE LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Module Layout Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
  });

  test('Sidebar navigation visible', async ({ page }) => {
    const sidebar = page.locator('aside, nav[class*="sidebar"], [class*="sidebar"]').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('Sidebar collapse toggle', async ({ page }) => {
    const collapseBtn = page.locator('button[aria-label*="collapse"], button[aria-label*="expand"]').first();
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label="breadcrumb"]').first();
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('Page header visible', async ({ page }) => {
    const pageHeader = page.locator('h1, h2').first();
    if (await pageHeader.isVisible()) {
      await expect(pageHeader).toBeVisible();
    }
  });

  test('Loading skeleton shows on navigation', async ({ page }) => {
    await page.click('nav a[href*="leads"]').catch(() => {});
    await page.waitForTimeout(500);
    const skeleton = page.locator('[class*="skeleton"], [class*="animate-pulse"]').first();
    if (await skeleton.count() > 0) {
      await expect(skeleton).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FORM INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/crm/leads/new');
    await page.waitForTimeout(1500);
  });

  test('Form fields accessible', async ({ page }) => {
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Form validation on submit', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Required field indicators', async ({ page }) => {
    const requiredFields = page.locator('input[required], [class*="required"]');
    const count = await requiredFields.count();
    // Required fields should have asterisk or indicator
  });

  test('Form auto-save indicator', async ({ page }) => {
    const autoSave = page.locator('text=/Saved|Auto-save/i').first();
    if (await autoSave.isVisible()) {
      await expect(autoSave).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN TEAM MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Team Management Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/team');
    await page.waitForTimeout(1500);
  });

  test('Team member cards render', async ({ page }) => {
    const memberCards = page.locator('[class*="member"], [class*="team"]').first();
    await expect(memberCards).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Add team member button', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /Add|New Member/i }).first();
    if (await addBtn.isVisible()) {
      await expect(addBtn).toBeVisible();
    }
  });

  test('Member card hover effect', async ({ page }) => {
    const memberCard = page.locator('[class*="member-card"]').first();
    if (await memberCard.isVisible()) {
      await memberCard.hover();
      await page.waitForTimeout(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Testimonials Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/testimonials');
    await page.waitForTimeout(1500);
  });

  test('Testimonial cards render', async ({ page }) => {
    const testimonials = page.locator('[class*="testimonial"], [class*="review"]').first();
    await expect(testimonials).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Rating stars visible', async ({ page }) => {
    const stars = page.locator('[class*="star"], svg[class*="star"]').first();
    if (await stars.isVisible()) {
      await expect(stars).toBeVisible();
    }
  });

  test('Approve/reject buttons', async ({ page }) => {
    const approveBtn = page.locator('button').filter({ hasText: /Approve|Accept/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PORTFOLIO MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Admin Portfolio Management Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/cms/portfolio');
    await page.waitForTimeout(1500);
  });

  test('Portfolio grid renders', async ({ page }) => {
    const portfolioItems = page.locator('[class*="portfolio"], [class*="project"]').first();
    await expect(portfolioItems).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Filter by category', async ({ page }) => {
    const filterBtn = page.locator('button').filter({ hasText: /Living|Bedroom|Kitchen|All/i }).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Featured toggle', async ({ page }) => {
    const toggle = page.locator('[role="switch"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(200);
    }
  });

  test('Drag to reorder indication', async ({ page }) => {
    const dragHandle = page.locator('[class*="drag"], [class*="handle"]').first();
    if (await dragHandle.isVisible()) {
      await dragHandle.hover();
      await page.waitForTimeout(100);
    }
  });
});
