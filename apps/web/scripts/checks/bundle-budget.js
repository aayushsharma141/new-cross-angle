import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_ASSETS = path.resolve(__dirname, '../../dist/assets');

const LIMITS = {
  MAIN_BUNDLE_KB: 350,
  APP_ROUTE_CHUNK_KB: 450,
  VENDOR_ENGINE_CHUNK_KB: 900,
};

function checkBundleBudget() {
  if (!fs.existsSync(DIST_ASSETS)) {
    console.warn(`⚠️ Warning: ${DIST_ASSETS} does not exist. Run vite build first.`);
    return;
  }

  const files = fs.readdirSync(DIST_ASSETS);
  const jsFiles = files.filter((f) => f.endsWith('.js'));

  let violations = 0;

  console.log('\n📊 Validating Production Bundle Size Budgets...');

  jsFiles.forEach((file) => {
    const filePath = path.join(DIST_ASSETS, file);
    const stats = fs.statSync(filePath);
    const sizeKb = Math.round(stats.size / 1024);

    const isMain = file.includes('index') || file.includes('main');
    const isVendorOrEngine =
      file.includes('react-vendor') ||
      file.includes('three') ||
      file.includes('icons') ||
      file.includes('discovery');

    const limitKb = isMain
      ? LIMITS.MAIN_BUNDLE_KB
      : isVendorOrEngine
      ? LIMITS.VENDOR_ENGINE_CHUNK_KB
      : LIMITS.APP_ROUTE_CHUNK_KB;

    if (sizeKb > limitKb) {
      console.error(`❌ BUDGET VIOLATION: ${file} is ${sizeKb} KB (Limit: ${limitKb} KB)`);
      violations++;
    } else {
      console.log(`  ✅ ${file.padEnd(42)} ${sizeKb.toString().padStart(5)} KB / ${limitKb} KB`);
    }
  });

  if (violations > 0) {
    console.error(`\n🚨 Bundle Budget Check Failed with ${violations} violation(s).\n`);
    process.exit(1);
  } else {
    console.log('\n✨ All bundle size budgets passed successfully!\n');
  }
}

checkBundleBudget();
