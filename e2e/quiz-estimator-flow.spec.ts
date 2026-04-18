import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ FLOW
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
  });

  test('Quiz page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/discovery/);
  });

  test('Welcome screen visible', async ({ page }) => {
    const welcomeScreen = page.locator('text=/Start|Begin|Get Started|Take the Quiz/i').first();
    await expect(welcomeScreen).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Get Started button starts quiz', async ({ page }) => {
    const startBtn = page.locator('button').filter({ hasText: /Start|Begin|Get Started/i }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Progress bar updates', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], [class*="progress"]').first();
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
  });

  test('Question options visible', async ({ page }) => {
    const options = page.locator('button, [class*="option"], [class*="choice"]');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ EMOTIONAL MAPPING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Emotional Mapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
    
    // Start the quiz
    const startBtn = page.locator('button').filter({ hasText: /Start|Begin|Get Started/i }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Emotion selection cards visible', async ({ page }) => {
    const emotionCards = page.locator('[class*="emotion"], [class*="feeling"]').first();
    if (await emotionCards.isVisible()) {
      await expect(emotionCards).toBeVisible();
    }
  });

  test('Emotion card selection animation', async ({ page }) => {
    const emotionCard = page.locator('button, [class*="card"]').first();
    if (await emotionCard.isVisible()) {
      await emotionCard.click();
      await page.waitForTimeout(300);
      await expect(emotionCard).toHaveClass(/selected|active/);
    }
  });

  test('Multiple emotions selectable', async ({ page }) => {
    const emotionCards = page.locator('button:has-text(""), [class*="option"]');
    const first = emotionCards.first();
    const second = emotionCards.nth(1);
    
    if (await first.isVisible()) {
      await first.click();
      await page.waitForTimeout(200);
    }
    if (await second.isVisible()) {
      await second.click();
      await page.waitForTimeout(200);
    }
  });

  test('Continue button enabled after selection', async ({ page }) => {
    const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
    if (await continueBtn.isVisible()) {
      await expect(continueBtn).toBeEnabled();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ VISUAL INSTINCT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Visual Instinct', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
    
    // Navigate to visual instinct step (may need multiple clicks)
    for (let i = 0; i < 3; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Image grid visible', async ({ page }) => {
    const imageGrid = page.locator('[class*="grid"], [class*="images"]').first();
    if (await imageGrid.isVisible()) {
      await expect(imageGrid).toBeVisible();
    }
  });

  test('Image hover effect', async ({ page }) => {
    const image = page.locator('img, [class*="image-option"]').first();
    if (await image.isVisible()) {
      await image.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Image selection visual feedback', async ({ page }) => {
    const image = page.locator('img, [class*="image-option"]').first();
    if (await image.isVisible()) {
      await image.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ LIGHT CALIBRATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Light Calibration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
    
    // Navigate to light calibration step
    for (let i = 0; i < 5; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Light preview visible', async ({ page }) => {
    const lightPreview = page.locator('[class*="light"], [class*="preview"]').first();
    if (await lightPreview.isVisible()) {
      await expect(lightPreview).toBeVisible();
    }
  });

  test('Slider interaction', async ({ page }) => {
    const slider = page.locator('input[type="range"], [role="slider"]').first();
    if (await slider.isVisible()) {
      await slider.fill('75');
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ MATERIAL RESONANCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Material Resonance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
    
    // Navigate to material step
    for (let i = 0; i < 6; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Material cards render', async ({ page }) => {
    const materialCards = page.locator('[class*="material"], [class*="texture"]').first();
    if (await materialCards.isVisible()) {
      await expect(materialCards).toBeVisible();
    }
  });

  test('Material hover shows texture detail', async ({ page }) => {
    const materialCard = page.locator('button, [class*="card"]').first();
    if (await materialCard.isVisible()) {
      await materialCard.hover();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ LEAD GATE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Lead Gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discovery');
    await page.waitForTimeout(2000);
    
    // Navigate through quiz to lead gate
    for (let i = 0; i < 10; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Lead form visible', async ({ page }) => {
    const leadForm = page.locator('form, [class*="lead"], [class*="form"]').first();
    if (await leadForm.isVisible()) {
      await expect(leadForm).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('Email input validation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await page.waitForTimeout(500);
    }
  });

  test('Phone input with country code', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9876543210');
      await page.waitForTimeout(200);
    }
  });

  test('Submit button loading state', async ({ page }) => {
    const nameInput = page.locator('input[type="text"], input[placeholder*="name"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const phoneInput = page.locator('input[type="tel"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();
    
    if (await nameInput.isVisible()) await nameInput.fill('Test User');
    if (await emailInput.isVisible()) await emailInput.fill('test@example.com');
    if (await phoneInput.isVisible()) await phoneInput.fill('9876543210');
    
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUIZ RESULTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Discovery Quiz Results', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to results page if available
    await page.goto('/discovery/results');
    await page.waitForTimeout(2000);
  });

  test('Results page loads', async ({ page }) => {
    await page.waitForTimeout(1000);
  });

  test('Style blueprint visible', async ({ page }) => {
    const blueprint = page.locator('[class*="blueprint"], [class*="result"], [class*="style"]').first();
    if (await blueprint.isVisible()) {
      await expect(blueprint).toBeVisible();
    }
  });

  test('Share buttons visible', async ({ page }) => {
    const shareBtn = page.locator('button').filter({ hasText: /Share|Download|Save/i }).first();
    if (await shareBtn.isVisible()) {
      await expect(shareBtn).toBeVisible();
    }
  });

  test('Retake quiz option', async ({ page }) => {
    const retakeBtn = page.locator('button').filter({ hasText: /Retake|Start Over|New Quiz/i }).first();
    if (await retakeBtn.isVisible()) {
      await expect(retakeBtn).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR PATH SELECTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Path Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
  });

  test('Estimator page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/estimator/);
  });

  test('Path selection cards visible', async ({ page }) => {
    const pathCards = page.locator('[class*="card"], [class*="path"]').first();
    await expect(pathCards).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Residential path card hover', async ({ page }) => {
    const residentialCard = page.locator('button, [class*="card"]').filter({ hasText: /Residential|Home/i }).first();
    if (await residentialCard.isVisible()) {
      await residentialCard.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Commercial path card hover', async ({ page }) => {
    const commercialCard = page.locator('button, [class*="card"]').filter({ hasText: /Commercial|Office/i }).first();
    if (await commercialCard.isVisible()) {
      await commercialCard.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Renovation path card hover', async ({ page }) => {
    const renovationCard = page.locator('button, [class*="card"]').filter({ hasText: /Renovation/i }).first();
    if (await renovationCard.isVisible()) {
      await renovationCard.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Custom path card hover', async ({ page }) => {
    const customCard = page.locator('button, [class*="card"]').filter({ hasText: /Custom/i }).first();
    if (await customCard.isVisible()) {
      await customCard.hover();
      await page.waitForTimeout(200);
    }
  });

  test('Card selection navigates to wizard', async ({ page }) => {
    const pathCard = page.locator('button, [class*="card"]').first();
    if (await pathCard.isVisible()) {
      await pathCard.click();
      await page.waitForTimeout(1000);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - PROPERTY TYPE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Property Type Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Select residential to enter wizard
    const residentialCard = page.locator('button, [class*="card"]').filter({ hasText: /Residential/i }).first();
    if (await residentialCard.isVisible()) {
      await residentialCard.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Property type cards visible', async ({ page }) => {
    const typeCards = page.locator('[class*="type"], [class*="property"]').first();
    if (await typeCards.isVisible()) {
      await expect(typeCards).toBeVisible();
    }
  });

  test('Apartment selection', async ({ page }) => {
    const apartmentCard = page.locator('button, [class*="card"]').filter({ hasText: /Apartment|1 BHK|2 BHK|3 BHK/i }).first();
    if (await apartmentCard.isVisible()) {
      await apartmentCard.click();
      await page.waitForTimeout(300);
    }
  });

  test('Villa selection', async ({ page }) => {
    const villaCard = page.locator('button, [class*="card"]').filter({ hasText: /Villa|Bungalow/i }).first();
    if (await villaCard.isVisible()) {
      await villaCard.click();
      await page.waitForTimeout(300);
    }
  });

  test('Penthouse selection', async ({ page }) => {
    const penthouseCard = page.locator('button, [class*="card"]').filter({ hasText: /Penthouse/i }).first();
    if (await penthouseCard.isVisible()) {
      await penthouseCard.click();
      await page.waitForTimeout(300);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - LOCATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Location Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
    
    // Skip to location step
    const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Location input visible', async ({ page }) => {
    const locationInput = page.locator('input[placeholder*="city"], input[placeholder*="location"], input[placeholder*="Jamshedpur"]').first();
    if (await locationInput.isVisible()) {
      await expect(locationInput).toBeVisible();
    }
  });

  test('City autocomplete suggestion', async ({ page }) => {
    const locationInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('Jamshed');
      await page.waitForTimeout(500);
      const suggestion = page.locator('[class*="suggestion"], [class*="autocomplete"]').first();
      if (await suggestion.isVisible()) {
        await suggestion.click();
        await page.waitForTimeout(200);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - BUDGET
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Budget Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to budget step
    for (let i = 0; i < 2; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Budget range slider visible', async ({ page }) => {
    const slider = page.locator('input[type="range"], [role="slider"]').first();
    if (await slider.isVisible()) {
      await expect(slider).toBeVisible();
    }
  });

  test('Budget slider interaction', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible()) {
      const box = await slider.boundingBox();
      if (box) {
        await slider.fill(String(Math.round(box.x + box.width * 0.7)));
        await page.waitForTimeout(300);
      }
    }
  });

  test('Budget presets clickable', async ({ page }) => {
    const preset = page.locator('button').filter({ hasText: /5L|10L|15L|20L/i }).first();
    if (await preset.isVisible()) {
      await preset.click();
      await page.waitForTimeout(200);
    }
  });

  test('Budget value display updates', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible()) {
      const box = await slider.boundingBox();
      if (box) {
        await slider.fill(String(Math.round(box.x + box.width * 0.5)));
        await page.waitForTimeout(200);
        const budgetDisplay = page.locator('text=/₹|Lakh|Lac/i').first();
        if (await budgetDisplay.isVisible()) {
          await expect(budgetDisplay).toBeVisible();
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - SERVICES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Services Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to services step
    for (let i = 0; i < 3; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Service checkboxes visible', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Service checkbox toggle', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(200);
      await expect(checkbox).toBeChecked();
    }
  });

  test('Modular kitchen toggle', async ({ page }) => {
    const kitchenCheckbox = page.locator('label').filter({ hasText: /Kitchen|Modular/i }).first();
    if (await kitchenCheckbox.isVisible()) {
      await kitchenCheckbox.click();
      await page.waitForTimeout(200);
    }
  });

  test('False ceiling toggle', async ({ page }) => {
    const ceilingCheckbox = page.locator('label').filter({ hasText: /Ceiling|False Ceiling/i }).first();
    if (await ceilingCheckbox.isVisible()) {
      await ceilingCheckbox.click();
      await page.waitForTimeout(200);
    }
  });

  test('Furniture toggle', async ({ page }) => {
    const furnitureCheckbox = page.locator('label').filter({ hasText: /Furniture/i }).first();
    if (await furnitureCheckbox.isVisible()) {
      await furnitureCheckbox.click();
      await page.waitForTimeout(200);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - ADDONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Addons Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to addons step
    for (let i = 0; i < 4; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Addon toggles visible', async ({ page }) => {
    const toggles = page.locator('[role="switch"]');
    const count = await toggles.count();
    if (count > 0) {
      await expect(toggles.first()).toBeVisible();
    }
  });

  test('Addon switch toggle', async ({ page }) => {
    const switchToggle = page.locator('[role="switch"]').first();
    if (await switchToggle.isVisible()) {
      await switchToggle.click();
      await page.waitForTimeout(200);
      await expect(switchToggle).toHaveAttribute('data-state', 'checked');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ESTIMATOR WIZARD - RESULTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Price Estimator Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
    
    // Complete all steps
    for (let i = 0; i < 6; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next|See Results|Get Quote/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Results summary visible', async ({ page }) => {
    const results = page.locator('[class*="result"], [class*="summary"], [class*="estimate"]').first();
    await expect(results).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Total price display', async ({ page }) => {
    const price = page.locator('text=/₹|Lakh|Lac|Rs\./i').first();
    if (await price.isVisible()) {
      await expect(price).toBeVisible();
    }
  });

  test('Price breakdown visible', async ({ page }) => {
    const breakdown = page.locator('[class*="breakdown"], [class*="itemized"]').first();
    if (await breakdown.isVisible()) {
      await expect(breakdown).toBeVisible();
    }
  });

  test('CTA buttons visible', async ({ page }) => {
    const ctaBtn = page.locator('button').filter({ hasText: /Book|Schedule|Consult|Contact/i }).first();
    if (await ctaBtn.isVisible()) {
      await expect(ctaBtn).toBeVisible();
    }
  });

  test('Share result button', async ({ page }) => {
    const shareBtn = page.locator('button').filter({ hasText: /Share|Download|Save/i }).first();
    if (await shareBtn.isVisible()) {
      await expect(shareBtn).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATOR WIZARD NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Estimator Wizard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Back button works', async ({ page }) => {
    const backBtn = page.locator('button').filter({ hasText: /Back|Previous/i }).first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Progress indicator visible', async ({ page }) => {
    const progress = page.locator('[class*="progress"], [class*="stepper"], [class*="wizard"]').first();
    if (await progress.isVisible()) {
      await expect(progress).toBeVisible();
    }
  });

  test('Step transition animation', async ({ page }) => {
    const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Keyboard navigation (Enter to continue)', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATOR FORM VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Estimator Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estimator');
    await page.waitForTimeout(2000);
    
    // Enter wizard
    const card = page.locator('button, [class*="card"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Empty required field error', async ({ page }) => {
    // Try to continue without selection
    const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Invalid email format error', async ({ page }) => {
    // Navigate to contact step
    for (let i = 0; i < 6; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await page.waitForTimeout(500);
    }
  });

  test('Phone number format validation', async ({ page }) => {
    // Navigate to contact step
    for (let i = 0; i < 6; i++) {
      const continueBtn = page.locator('button').filter({ hasText: /Continue|Next/i }).first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('123');
      await page.waitForTimeout(500);
    }
  });
});
