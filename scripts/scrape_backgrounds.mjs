import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = 'C:\\Users\\aayus\\.gemini\\antigravity-ide\\brain\\a6a439f8-f3f3-41f3-beb4-bb395aaefa4d';
const screenshotsDir = path.join(artifactsDir, 'reactbits_screenshots');
const dataFilePath = path.join(artifactsDir, 'reactbits_backgrounds_data.json');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const backgrounds = [
  {"text":"Liquid Ether","slug":"liquid-ether"},
  {"text":"Prism","slug":"prism"},
  {"text":"Dark Veil","slug":"dark-veil"},
  {"text":"Light Pillar","slug":"light-pillar"},
  {"text":"Silk","slug":"silk"},
  {"text":"Floating Lines","slug":"floating-lines"},
  {"text":"Light Rays","slug":"light-rays"},
  {"text":"Pixel Blast","slug":"pixel-blast"},
  {"text":"Color Bends","slug":"color-bends"},
  {"text":"Evil Eye","slug":"evil-eye"},
  {"text":"Line Waves","slug":"line-waves"},
  {"text":"Radar","slug":"radar"},
  {"text":"Soft Aurora","slug":"soft-aurora"},
  {"text":"Aurora","slug":"aurora"},
  {"text":"Plasma","slug":"plasma"},
  {"text":"Plasma Wave","slug":"plasma-wave"},
  {"text":"Particles","slug":"particles"},
  {"text":"Gradient Blinds","slug":"gradient-blinds"},
  {"text":"Grainient","slug":"grainient"},
  {"text":"Grid Scan","slug":"grid-scan"},
  {"text":"Beams","slug":"beams"},
  {"text":"Pixel Snow","slug":"pixel-snow"},
  {"text":"Lightning","slug":"lightning"},
  {"text":"Prismatic Burst","slug":"prismatic-burst"},
  {"text":"Galaxy","slug":"galaxy"},
  {"text":"Dither","slug":"dither"},
  {"text":"Faulty Terminal","slug":"faulty-terminal"},
  {"text":"Ripple Grid","slug":"ripple-grid"},
  {"text":"Dot Field","slug":"dot-field"},
  {"text":"Dot Grid","slug":"dot-grid"},
  {"text":"Threads","slug":"threads"},
  {"text":"Hyperspeed","slug":"hyperspeed"},
  {"text":"Iridescence","slug":"iridescence"},
  {"text":"Waves","slug":"waves"},
  {"text":"Grid Distortion","slug":"grid-distortion"},
  {"text":"Ballpit","slug":"ballpit"},
  {"text":"Orb","slug":"orb"},
  {"text":"Letter Glitch","slug":"letter-glitch"},
  {"text":"Grid Motion","slug":"grid-motion"},
  {"text":"Shape Grid","slug":"shape-grid"},
  {"text":"Liquid Chrome","slug":"liquid-chrome"},
  {"text":"Balatro","slug":"balatro"}
];

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const results = [];

  for (let i = 0; i < backgrounds.length; i++) {
    const bg = backgrounds[i];
    const url = `https://reactbits.dev/backgrounds/${bg.slug}`;
    console.log(`[${i + 1}/${backgrounds.length}] Visiting ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Wait a short bit for loading models, three.js canvas inside demo-container
      await page.waitForTimeout(2500);

      // Try to turn off Demo Content to get a clean background
      await page.evaluate(() => {
        const label = Array.from(document.querySelectorAll('*')).find(el => el.textContent === 'Demo Content');
        if (label) {
          const parent = label.parentElement;
          const interactive = parent.querySelector('button, input, [role="checkbox"], [role="switch"]') || parent;
          interactive.click();
        }
      });
      // Wait for the toggle to settle
      await page.waitForTimeout(500);

      // Take a screenshot of specifically the .demo-container area
      const demoContainer = page.locator('.demo-container');
      const screenshotPath = path.join(screenshotsDir, `${bg.slug}.png`);
      if (await demoContainer.count() > 0) {
        await demoContainer.screenshot({ path: screenshotPath });
        console.log(`Saved screenshot to ${screenshotPath}`);
      } else {
        // Fallback to viewport screenshot
        await page.screenshot({ path: screenshotPath });
        console.log(`Fallback screenshot saved to ${screenshotPath}`);
      }

      // Extract props and description
      const data = await page.evaluate(() => {
        const props = [];
        const tableElement = document.querySelector('table');
        if (tableElement) {
          const rows = Array.from(tableElement.querySelectorAll('tr'));
          rows.forEach((row, index) => {
            if (index === 0) return; // skip header
            const cells = Array.from(row.querySelectorAll('td')).map(c => c.textContent.trim());
            if (cells.length >= 3) {
              props.push({
                property: cells[0],
                type: cells[1],
                default: cells[2],
                description: cells[3] || ''
              });
            }
          });
        }

        // Get description
        const descriptionElement = document.querySelector('.category-page p, .page-transition-fade p');
        const description = descriptionElement ? descriptionElement.textContent.trim() : '';

        // Get dependencies
        const deps = [];
        const depHeading = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent.includes('Dependencies'));
        if (depHeading) {
          let sibling = depHeading.nextElementSibling;
          while (sibling && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
            const listItems = sibling.querySelectorAll('li, code');
            if (listItems.length > 0) {
              listItems.forEach(li => {
                const text = li.textContent.trim();
                if (text && !deps.includes(text)) deps.push(text);
              });
            } else if (sibling.tagName === 'CODE') {
              const text = sibling.textContent.trim();
              if (text && !deps.includes(text)) deps.push(text);
            }
            sibling = sibling.nextElementSibling;
          }
        }

        return { description, props, deps };
      });

      results.push({
        name: bg.text,
        slug: bg.slug,
        description: data.description,
        props: data.props,
        dependencies: data.deps,
        screenshot: `reactbits_screenshots/${bg.slug}.png`
      });

      console.log(`Successfully scraped ${bg.text}`);
    } catch (err) {
      console.error(`Error scraping ${bg.text}:`, err);
      // Push placeholder
      results.push({
        name: bg.text,
        slug: bg.slug,
        description: 'Failed to retrieve description.',
        props: [],
        dependencies: [],
        error: err.message
      });
    }
  }

  // Save the scraped data
  fs.writeFileSync(dataFilePath, JSON.stringify(results, null, 2));
  console.log(`All scraping complete! Data saved to ${dataFilePath}`);

  await browser.close();
}

run().catch(console.error);
