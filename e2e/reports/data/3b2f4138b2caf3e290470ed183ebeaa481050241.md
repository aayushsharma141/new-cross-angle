# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-interactions.spec.ts >> Admin Data Table Micro-Interactions >> Table headers sortable
- Location: e2e\admin-interactions.spec.ts:140:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - complementary [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img [ref=e8]
          - text: Privacy Controls
        - heading "Essential storage keeps the site fast. Optional analytics helps us improve it." [level=2] [ref=e11]
        - paragraph [ref=e12]: Choose whether we can load measurement scripts. Strict mode keeps only the experience-critical pieces and skips analytics or tracking.
      - generic [ref=e13]:
        - button "Strict Only" [ref=e14] [cursor=pointer]
        - button "Accept All" [ref=e15] [cursor=pointer]:
          - img
          - text: Accept All
  - generic [ref=e16]:
    - img "Interior Luxury" [ref=e18]
    - generic [ref=e20]:
      - img "CrossAngle Intelligence" [ref=e25]
      - generic [ref=e28]:
        - heading "Admin Sign In" [level=1] [ref=e29]
        - paragraph [ref=e30]: Authorized admins only
        - generic [ref=e31]:
          - generic [ref=e32]:
            - text: Email Address
            - generic [ref=e33]:
              - img [ref=e34]
              - textbox "Email Address" [ref=e37]:
                - /placeholder: admin@crossangle.com
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]: Password
              - button "Forgot Password?" [ref=e41] [cursor=pointer]
            - generic [ref=e42]:
              - img [ref=e43]
              - textbox "Password" [ref=e46]:
                - /placeholder: ••••••••
              - button "Show password" [ref=e47] [cursor=pointer]:
                - img [ref=e48]
          - generic [ref=e51]:
            - checkbox "Keep me signed in" [ref=e52] [cursor=pointer]
            - checkbox
            - generic [ref=e53] [cursor=pointer]: Keep me signed in
          - button "Sign In" [ref=e54] [cursor=pointer]:
            - text: Sign In
            - img
      - generic [ref=e55]:
        - generic [ref=e58]: Secure Connection
        - generic [ref=e60]: Analytics OS v3.0.0
```

# Test source

```ts
  43  |     
  44  |     if (await emailInput.isVisible() && await passwordInput.isVisible()) {
  45  |       await emailInput.fill('invalid@test.com');
  46  |       await passwordInput.fill('wrongpassword');
  47  |       await submitBtn.click();
  48  |       await page.waitForTimeout(1000);
  49  |     }
  50  |   });
  51  | 
  52  |   test('Login redirect to dashboard on success', async ({ page }) => {
  53  |     // This test assumes valid credentials - adjust for your auth setup
  54  |     await page.goto('/admin/dashboard');
  55  |     await page.waitForTimeout(2000);
  56  |   });
  57  | });
  58  | 
  59  | // ─────────────────────────────────────────────────────────────────────────────
  60  | // ADMIN DASHBOARD
  61  | // ─────────────────────────────────────────────────────────────────────────────
  62  | test.describe('Admin Dashboard Micro-Interactions', () => {
  63  |   test.beforeEach(async ({ page }) => {
  64  |     await page.goto('/admin/dashboard');
  65  |     await page.waitForTimeout(1000);
  66  |   });
  67  | 
  68  |   test('Dashboard KPI cards render', async ({ page }) => {
  69  |     const kpiCards = page.locator('[class*="rounded-2xl"][class*="bg-"], [class*="AdminKPI"]').first();
  70  |     await expect(kpiCards).toBeVisible({ timeout: 5000 }).catch(() => {});
  71  |   });
  72  | 
  73  |   test('Tab navigation switches content', async ({ page }) => {
  74  |     const tabs = page.locator('button').filter({ hasText: /Business|Website|Products|Server|System/i });
  75  |     const count = await tabs.count();
  76  |     
  77  |     if (count > 1) {
  78  |       await tabs.nth(1).click();
  79  |       await page.waitForTimeout(500);
  80  |       await expect(tabs.nth(1)).toHaveAttribute('aria-current', 'page');
  81  |     }
  82  |   });
  83  | 
  84  |   test('Date range picker opens', async ({ page }) => {
  85  |     const datePicker = page.locator('button').filter({ hasText: /Today|This Week|This Month|Custom/i }).first();
  86  |     if (await datePicker.isVisible()) {
  87  |       await datePicker.click();
  88  |       await page.waitForTimeout(300);
  89  |     }
  90  |   });
  91  | 
  92  |   test('Export data button triggers download', async ({ page }) => {
  93  |     const exportBtn = page.locator('button').filter({ hasText: /Export|Download/i }).first();
  94  |     if (await exportBtn.isVisible()) {
  95  |       await exportBtn.click();
  96  |       await page.waitForTimeout(500);
  97  |     }
  98  |   });
  99  | 
  100 |   test('Quick action buttons navigate', async ({ page }) => {
  101 |     const quickAction = page.locator('a[href*="/admin/"], button').filter({ hasText: /New Lead|CMS Build|Outreach|Resources/i }).first();
  102 |     if (await quickAction.isVisible()) {
  103 |       await quickAction.click();
  104 |       await page.waitForTimeout(500);
  105 |     }
  106 |   });
  107 | 
  108 |   test('System health indicators visible', async ({ page }) => {
  109 |     const healthSection = page.locator('text=System Health').first();
  110 |     if (await healthSection.isVisible()) {
  111 |       await expect(healthSection).toBeVisible();
  112 |     }
  113 |   });
  114 | 
  115 |   test('Charts render in dashboard', async ({ page }) => {
  116 |     const chartContainers = page.locator('[class*="chart"], [class*="recharts"]').first();
  117 |     if (await chartContainers.isVisible()) {
  118 |       await expect(chartContainers).toBeVisible({ timeout: 3000 }).catch(() => {});
  119 |     }
  120 |   });
  121 | 
  122 |   test('Insight cards dismissible', async ({ page }) => {
  123 |     const dismissBtn = page.locator('button').filter({ hasText: /Dismiss|Close/i }).first();
  124 |     if (await dismissBtn.isVisible()) {
  125 |       await dismissBtn.click();
  126 |       await page.waitForTimeout(300);
  127 |     }
  128 |   });
  129 | });
  130 | 
  131 | // ─────────────────────────────────────────────────────────────────────────────
  132 | // ADMIN DATA TABLE
  133 | // ─────────────────────────────────────────────────────────────────────────────
  134 | test.describe('Admin Data Table Micro-Interactions', () => {
  135 |   test.beforeEach(async ({ page }) => {
  136 |     await page.goto('/admin/crm/leads');
  137 |     await page.waitForTimeout(1500);
  138 |   });
  139 | 
  140 |   test('Table headers sortable', async ({ page }) => {
  141 |     const headers = page.locator('th');
  142 |     const headerCount = await headers.count();
> 143 |     expect(headerCount).toBeGreaterThan(0);
      |                         ^ Error: expect(received).toBeGreaterThan(expected)
  144 |   });
  145 | 
  146 |   test('Row hover highlight', async ({ page }) => {
  147 |     const firstRow = page.locator('tbody tr, [role="row"]').first();
  148 |     if (await firstRow.isVisible()) {
  149 |       await firstRow.hover();
  150 |       await page.waitForTimeout(100);
  151 |     }
  152 |   });
  153 | 
  154 |   test('Pagination controls visible', async ({ page }) => {
  155 |     const pagination = page.locator('button').filter({ hasText: /Previous|Next|Page/i }).first();
  156 |     if (await pagination.isVisible()) {
  157 |       await expect(pagination).toBeVisible();
  158 |     }
  159 |   });
  160 | 
  161 |   test('Search filter works', async ({ page }) => {
  162 |     const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  163 |     if (await searchInput.isVisible()) {
  164 |       await searchInput.fill('test');
  165 |       await page.waitForTimeout(500);
  166 |     }
  167 |   });
  168 | 
  169 |   test('Bulk selection checkbox', async ({ page }) => {
  170 |     const checkbox = page.locator('input[type="checkbox"]').first();
  171 |     if (await checkbox.isVisible()) {
  172 |       await checkbox.check();
  173 |       await page.waitForTimeout(200);
  174 |     }
  175 |   });
  176 | 
  177 |   test('Bulk actions toolbar appears on selection', async ({ page }) => {
  178 |     const checkbox = page.locator('input[type="checkbox"]').nth(1);
  179 |     if (await checkbox.isVisible()) {
  180 |       await checkbox.check();
  181 |       await page.waitForTimeout(300);
  182 |     }
  183 |   });
  184 | 
  185 |   test('Column sort toggle', async ({ page }) => {
  186 |     const sortableHeader = page.locator('th[aria-sort], th').first();
  187 |     if (await sortableHeader.isVisible()) {
  188 |       await sortableHeader.click();
  189 |       await page.waitForTimeout(300);
  190 |       await sortableHeader.click();
  191 |     }
  192 |   });
  193 | });
  194 | 
  195 | // ─────────────────────────────────────────────────────────────────────────────
  196 | // ADMIN LEAD DETAIL SHEET
  197 | // ─────────────────────────────────────────────────────────────────────────────
  198 | test.describe('Admin Lead Detail Sheet Micro-Interactions', () => {
  199 |   test.beforeEach(async ({ page }) => {
  200 |     await page.goto('/admin/crm/leads');
  201 |     await page.waitForTimeout(1500);
  202 |   });
  203 | 
  204 |   test('Lead row click opens detail sheet', async ({ page }) => {
  205 |     const leadRow = page.locator('tbody tr, [role="row"]').first();
  206 |     if (await leadRow.isVisible()) {
  207 |       await leadRow.click();
  208 |       await page.waitForTimeout(500);
  209 |       const sheet = page.locator('[role="dialog"], [data-state="open"]').first();
  210 |       await expect(sheet).toBeVisible({ timeout: 2000 }).catch(() => {});
  211 |     }
  212 |   });
  213 | 
  214 |   test('Sheet slides in from right', async ({ page }) => {
  215 |     const leadRow = page.locator('tbody tr, [role="row"]').first();
  216 |     if (await leadRow.isVisible()) {
  217 |       await leadRow.click();
  218 |       await page.waitForTimeout(400);
  219 |     }
  220 |   });
  221 | 
  222 |   test('Sheet close button works', async ({ page }) => {
  223 |     const leadRow = page.locator('tbody tr, [role="row"]').first();
  224 |     if (await leadRow.isVisible()) {
  225 |       await leadRow.click();
  226 |       await page.waitForTimeout(500);
  227 |       const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], [data-state="open"] button[aria-label*="close"]').first();
  228 |       if (await closeBtn.isVisible()) {
  229 |         await closeBtn.click();
  230 |         await page.waitForTimeout(300);
  231 |       }
  232 |     }
  233 |   });
  234 | 
  235 |   test('Sheet tabs navigation', async ({ page }) => {
  236 |     const leadRow = page.locator('tbody tr, [role="row"]').first();
  237 |     if (await leadRow.isVisible()) {
  238 |       await leadRow.click();
  239 |       await page.waitForTimeout(500);
  240 |       const tabs = page.locator('[role="tab"]').first();
  241 |       if (await tabs.isVisible()) {
  242 |         await tabs.click();
  243 |         await page.waitForTimeout(200);
```